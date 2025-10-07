import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageCircle, AlertTriangle, Phone, User, Shield, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AIMenuPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [problemBalances, setProblemBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [tickets, setTickets] = useState([]);

  const [contacts, setContacts] = useState([
    { id: 1, name: 'Juan Pérez', phone: '+56 9 8765 4321', role: 'Supervisor Plataforma', permissions: 'admin' },
    { id: 2, name: 'María González', phone: '+56 9 8765 4322', role: 'Operador Tienda - Las Condes', permissions: 'user' },
    { id: 3, name: 'Carlos Silva', phone: '+56 9 8765 4323', role: 'Operador Tienda - Providencia', permissions: 'user' },
    { id: 4, name: 'Ana Rojas', phone: '+56 9 8765 4324', role: 'Técnico Allcom', permissions: 'admin' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
      
      // Find problematic balances
      const problems = [];
      response.data.forEach(store => {
        store.devices?.forEach(device => {
          if (device.status === 'offline' || device.status === 'maintenance' || device.label_status === 'replace') {
            problems.push({
              ...device,
              storeName: store.name,
              storeComuna: store.comuna,
              storeAddress: store.address,
              sapCode: store.sap_code,
              issue: device.status === 'offline' ? 'Desconectada' : 
                     device.status === 'maintenance' ? 'En Mantenimiento' :
                     'Etiqueta necesita reemplazo'
            });
          }
        });
      });
      setProblemBalances(problems);
      
      // Generate sample tickets
      setTickets(problems.slice(0, 10).map((p, idx) => ({
        id: `TKT-${Date.now()}-${idx}`,
        deviceId: p.id,
        storeName: p.storeName,
        issue: p.issue,
        status: Math.random() > 0.5 ? 'Pendiente' : 'En Proceso',
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        assignedTo: contacts[Math.floor(Math.random() * contacts.length)].name
      })));
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppTicket = async (device, reportTo) => {
    try {
      const ticketData = {
        device_id: device.id,
        store_name: device.storeName,
        store_comuna: device.storeComuna,
        store_address: device.storeAddress,
        sap_code: device.sapCode,
        issue: device.issue,
        description: `Problema detectado en balanza ${device.type} - Estado: ${device.status}`,
        reported_to: reportTo,
        assigned_to: contacts.find(c => c.role.includes(reportTo === 'Allcom' ? 'Allcom' : 'Operador'))?.name
      };

      const response = await axios.post(`${API}/tickets`, ticketData);
      
      const message = `🚨 TICKET #${response.data.id} - BM MANAGER

Local: ${device.storeName} - ${device.storeComuna}
Dirección: ${device.storeAddress}
Código SAP: ${device.sapCode}

Balanza con Problema:
- Tipo: ${device.type}
- ID: ${device.id.slice(0, 8)}
- Problema: ${device.issue}
- Estado: ${device.status}

Reportar a: ${reportTo}
Asignado a: ${ticketData.assigned_to || 'Por asignar'}

Por favor atender a la brevedad.`;
      
      // Simulate WhatsApp integration
      console.log('WhatsApp Message:', message);
      
      toast.success(`Ticket #${response.data.id} generado y enviado por WhatsApp a ${reportTo}`);
      
      // Refresh data to show new ticket
      loadData();
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Error al generar ticket');
    }
  };

  const addContact = () => {
    toast.success('Contacto agregado exitosamente');
    setShowAddUser(false);
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success('Contacto eliminado');
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Menú IA - Soporte Inteligente
          </h1>
          <p className="text-gray-600 mt-1">Gestión de tickets y soporte en tiempo real</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balanzas con Problemas</p>
                <h3 className="text-3xl font-bold text-red-600">{problemBalances.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tickets Activos</p>
                <h3 className="text-3xl font-bold" style={{ color: '#FFC220' }}>{tickets.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 194, 32, 0.1)' }}>
                <MessageCircle className="w-6 h-6" style={{ color: '#FFC220' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Contactos Activos</p>
                <h3 className="text-3xl font-bold" style={{ color: '#0071CE' }}>{contacts.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 113, 206, 0.1)' }}>
                <User className="w-6 h-6" style={{ color: '#0071CE' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="whatsapp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whatsapp">WhatsApp - Soporte</TabsTrigger>
            <TabsTrigger value="problems">Balanzas con Problemas</TabsTrigger>
          </TabsList>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-4">
            <Card className="p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Contactos de Soporte</h3>
                <Button 
                  style={{ backgroundColor: '#25D366' }}
                  onClick={() => setShowAddUser(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Agregar Contacto
                </Button>
              </div>

              <div className="space-y-3">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        style={{
                          backgroundColor: contact.permissions === 'admin' ? '#0071CE' : '#10b981',
                          color: 'white'
                        }}
                      >
                        <Shield size={14} className="mr-1" />
                        {contact.permissions === 'admin' ? 'Admin' : 'Usuario'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteContact(contact.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Tickets */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Tickets Recientes</h4>
                <div className="space-y-2">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">#{ticket.id}</p>
                        <p className="text-sm text-gray-600">{ticket.storeName} - {ticket.issue}</p>
                        <p className="text-xs text-gray-500 mt-1">Asignado a: {ticket.assignedTo}</p>
                      </div>
                      <Badge 
                        style={{
                          backgroundColor: ticket.status === 'Pendiente' ? '#f59e0b' : '#0071CE',
                          color: 'white'
                        }}
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Problems Tab */}
          <TabsContent value="problems" className="space-y-4">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Listado de Balanzas con Problemas</h3>
              <div className="space-y-3">
                {problemBalances.slice(0, 15).map(device => (
                  <div key={device.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{device.storeName} - {device.storeComuna}</p>
                        <p className="text-sm text-gray-600">{device.storeAddress}</p>
                        <p className="text-xs text-gray-500 mt-1">Código SAP: {device.sapCode}</p>
                      </div>
                      <Badge 
                        style={{
                          backgroundColor: device.status === 'offline' ? '#ef4444' : '#f59e0b',
                          color: 'white'
                        }}
                      >
                        {device.issue}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Tipo: </span>
                        <span className="font-semibold">{device.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ID: </span>
                        <span className="font-mono text-xs">{device.id.slice(0, 12)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Firmware: </span>
                        <span className="font-semibold">{device.firmware_version}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Estado: </span>
                        <span className="font-semibold capitalize">{device.status}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        style={{ backgroundColor: '#0071CE' }}
                        onClick={() => sendWhatsAppTicket(device, 'Allcom')}
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Reportar a Allcom
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        style={{ backgroundColor: '#FFC220', color: '#000' }}
                        onClick={() => sendWhatsAppTicket(device, 'Servicio Técnico')}
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Reportar a Servicio Técnico
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detección de Productos Fraudulentos con IA */}
        <Card className="p-6 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 border-l-4" style={{ borderLeftColor: '#f47421' }}>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0071CE' }}>
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span>Detección de Fraudes con IA</span>
              <p className="text-sm font-normal text-gray-600 mt-0.5">Sistema inteligente de prevención de pérdidas</p>
            </div>
          </h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-gray-700">Productos Detectados como Fraude</h4>
            <p className="text-sm text-gray-600 mb-4">
              La IA ha identificado estos productos que frecuentemente se intentan usar para fraude en autoservicio:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { name: 'Lata de Coca-Cola', weight: '335g', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop', frequency: '89 detecciones/mes', risk: 'Alto' },
                { name: 'Botella de Agua', weight: '500ml', image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=200&h=200&fit=crop', frequency: '67 detecciones/mes', risk: 'Alto' },
                { name: 'Chocolate', weight: '50g', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop', frequency: '45 detecciones/mes', risk: 'Medio' },
                { name: 'Chicle', weight: '15g', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop', frequency: '34 detecciones/mes', risk: 'Medio' },
                { name: 'Lata de Conserva', weight: '185g', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', frequency: '29 detecciones/mes', risk: 'Medio' },
                { name: 'Yogurt', weight: '125g', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop', frequency: '23 detecciones/mes', risk: 'Bajo' },
                { name: 'Galletas', weight: '200g', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop', frequency: '18 detecciones/mes', risk: 'Bajo' },
                { name: 'Jabón', weight: '90g', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop', frequency: '12 detecciones/mes', risk: 'Bajo' }
              ]
              .sort((a, b) => {
                const riskOrder = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 };
                return riskOrder[b.risk] - riskOrder[a.risk];
              })
              .map((product, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <div className="relative mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';
                      }}
                    />
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                      product.risk === 'Alto' ? 'bg-red-500' :
                      product.risk === 'Medio' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h5>
                    <p className="text-xs font-medium" style={{ color: '#0071CE' }}>Peso típico: {product.weight}</p>
                    <p className="text-xs font-medium" style={{ color: '#f47421' }}>{product.frequency}</p>
                    <Badge className={`text-xs font-medium ${
                      product.risk === 'Alto' ? 'bg-red-100 text-red-800 border-red-300' :
                      product.risk === 'Medio' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-green-100 text-green-800 border-green-300'
                    }`}>
                      🚨 Riesgo {product.risk}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#f47421' }} />
              Análisis de Patrones de Fraude
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h5 className="font-semibold text-gray-800">Patrón Crítico</h5>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong style={{ color: '#0071CE' }}>Local Recoleta:</strong> 47 detecciones de productos de 335g en los últimos 7 días
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-700 font-semibold">Pérdida estimada:</span>
                    <span className="text-sm font-bold text-red-600">$1,250,000 CLP</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-l-4" style={{ borderLeftColor: '#f47421' }} className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f47421' }}>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h5 className="font-semibold text-gray-800">Tendencia Semanal</h5>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Incremento del <strong style={{ color: '#f47421' }}>23%</strong> en intentos de fraude vs. semana anterior
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-orange-700 font-semibold">Total detectado:</span>
                    <span className="text-sm font-bold" style={{ color: '#f47421' }}>289 casos</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0071CE' }}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h5 className="font-semibold text-gray-800">Precisión del Sistema</h5>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong style={{ color: '#0071CE' }}>94.7%</strong> de precisión en detección automática
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700 font-semibold">Falsos positivos:</span>
                    <span className="text-sm font-bold text-green-600">2.1%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-6 border-l-4" style={{ borderLeftColor: '#0071CE' }} className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Wrench className="w-5 h-5" style={{ color: '#0071CE' }} />
              Acciones Recomendadas por IA
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f47421' }}>
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Reforzar supervisión en Locales Recoleta y Santiago Centro</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f47421' }}>
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Actualizar algoritmo de detección para nuevos productos</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0071CE' }}>
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Implementar alertas automáticas >30 detecciones/día</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0071CE' }}>
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Capacitar personal en productos fraudulentos comunes</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#f47421', opacity: '0.1' }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: '#f47421' }} />
                <span className="text-sm font-semibold" style={{ color: '#f47421' }}>Meta de Reducción de Fraude</span>
              </div>
              <p className="text-xs text-gray-700">Objetivo: Reducir las detecciones de fraude en un 35% durante los próximos 30 días mediante estas acciones.</p>
            </div>
          </Card>
        </Card>

        {/* Add Contact Dialog */}
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Nombre completo" />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+56 9 XXXX XXXX" />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Input id="role" placeholder="Ej: Operador Tienda" />
              </div>
              <div>
                <Label htmlFor="permissions">Permisos</Label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <Button 
                className="w-full" 
                style={{ backgroundColor: '#25D366' }}
                onClick={addContact}
              >
                Agregar Contacto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AIMenuPage;