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
        assigned_to: contacts.find(c => c.role.includes(reportTo === 'Alcom' ? 'Alcom' : 'Operador'))?.name
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
                        onClick={() => sendWhatsAppTicket(device, 'Alcom')}
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