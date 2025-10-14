import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Search, HardDrive, Calendar, CheckCircle, AlertCircle, Plus, Settings, Zap, Network, Package, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import NewBalanceForm from '@/components/NewBalanceForm';

const AssetPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewBalanceForm, setShowNewBalanceForm] = useState(false);
  
  // AI Vendor states
  const [grabitEnabled, setGrabitEnabled] = useState(false);
  const [edgifyEnabled, setEdgifyEnabled] = useState(false);
  const [grabitProgress, setGrabitProgress] = useState([]);
  const [edgifyProgress, setEdgifyProgress] = useState([]);
  const [grabitStatus, setGrabitStatus] = useState('inactive');
  const [edgifyStatus, setEdgifyStatus] = useState('inactive');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API}/stores`, { timeout: 10000 });
      setStores(response.data);
      
      // Flatten all devices with store info
      const devices = [];
      response.data.forEach(store => {
        store.devices?.forEach(device => {
          // Generate random serial like BMCL-9E998776
          const randomHex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
          devices.push({
            ...device,
            storeName: store.name,
            storeComuna: store.comuna,
            storeId: store.id,
            serialNumber: `BMCL-${randomHex}`,
            provider: device.type === 'IA' ? 'Allcom IA Systems' : 'Balanzas Chile S.A.',
            licenseStatus: Math.random() > 0.1 ? 'active' : 'pending',
            warrantyExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        });
      });
      
      setAllDevices(devices);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Error al cargar activos');
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = allDevices.filter(device => 
    device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNewBalance = async (newBalance) => {
    try {
      // Add to local state
      const device = {
        id: `new-${Date.now()}`,
        serialNumber: newBalance.serialNumber,
        storeName: newBalance.storeName,
        storeComuna: newBalance.storeComuna,
        brand: newBalance.brand,
        type: newBalance.type,
        paperType: newBalance.paperType,
        installation_date: newBalance.installationDate,
        provider: newBalance.provider,
        ipAddress: newBalance.ipAddress,
        macAddress: newBalance.macAddress,
        providerKey: newBalance.providerKey,
        jsonIAKey: newBalance.jsonIAKey,
        licenseStatus: 'active',
        warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      setAllDevices([device, ...allDevices]);
      toast.success(`Balanza ${newBalance.brand} configurada exitosamente`);
      setShowNewBalanceForm(false);
      
      // Here you would normally save to backend
      // await axios.post(`${API}/balances`, newBalance);
    } catch (error) {
      toast.error('Error al guardar la balanza');
      console.error(error);
    }
  };

  const simulateConnection = async (vendor, setProgress, setStatus) => {
    const steps = [
      { icon: Zap, text: `Conectando con ${vendor}...`, delay: 2000 },
      { icon: Package, text: 'Descargando y activando servicios...', delay: 2000 },
      { icon: Network, text: 'Distribuyendo a assets Walmart...', delay: 2000 },
      { icon: CheckCircle2, text: 'Concluido - Servicios activos', delay: 1500, final: true }
    ];

    setProgress([]);
    setStatus('connecting');

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 300 : steps[i - 1].delay));
      setProgress(prev => [...prev, steps[i]]);
      
      if (steps[i].final) {
        setStatus('connected');
      }
    }
  };

  const handleGrabitToggle = async (checked) => {
    setGrabitEnabled(checked);
    if (checked) {
      await simulateConnection('GRABIT', setGrabitProgress, setGrabitStatus);
      toast.success('GRABIT conectado exitosamente');
    } else {
      setGrabitProgress([]);
      setGrabitStatus('inactive');
      toast.info('GRABIT desconectado');
    }
  };

  const handleEdgifyToggle = async (checked) => {
    setEdgifyEnabled(checked);
    if (checked) {
      await simulateConnection('EDGIFY', setEdgifyProgress, setEdgifyStatus);
      toast.success('EDGIFY conectado exitosamente');
    } else {
      setEdgifyProgress([]);
      setEdgifyStatus('inactive');
      toast.info('EDGIFY desconectado');
    }
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
        {showNewBalanceForm ? (
          <NewBalanceForm 
            stores={stores}
            onSave={handleSaveNewBalance}
            onCancel={() => setShowNewBalanceForm(false)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Activos
                </h1>
                <p className="text-gray-600 mt-1">Inventario completo de balanzas</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="px-4 py-2 text-base" style={{ backgroundColor: '#0071CE', color: 'white' }}>
                  Total Activos: {allDevices.length}
                </Badge>
              </div>
            </div>

            {/* Configure New Balance Button */}
            <Card 
              className="p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 hover:scale-[1.02]"
              style={{ 
                borderColor: '#0071CE',
                background: 'linear-gradient(135deg, rgba(0, 113, 206, 0.05) 0%, rgba(255, 194, 32, 0.05) 100%)'
              }}
              onClick={() => setShowNewBalanceForm(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#0071CE' }}
                  >
                    <Settings className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Configurar Nueva Balanza
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Registre un nuevo equipo multimarca en el sistema con toda su información técnica
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Compatible con: Marques, Dibal, Digi, Bizerba, Mettler Toledo, Covitel
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Plus size={32} style={{ color: '#0071CE' }} />
                </div>
              </div>
            </Card>

            {/* AI Vendor External Module */}
            <Card className="p-8 shadow-xl border-2" style={{ borderColor: '#6366f1' }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Vendor Externo de IA
                </h2>
                <p className="text-gray-600">
                  Conecte e integre servicios de IA externos para detección de fraude y análisis inteligente
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GRABIT Card */}
                <Card className="p-6 border-2 transition-all" style={{ 
                  borderColor: grabitStatus === 'connected' ? '#10b981' : grabitStatus === 'connecting' ? '#f59e0b' : '#e5e7eb',
                  backgroundColor: grabitStatus === 'connected' ? 'rgba(16, 185, 129, 0.05)' : 'white'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white p-2 shadow-md">
                        <img 
                          src="https://customer-assets.emergentagent.com/job_bm-intelligence/artifacts/rolvx4qh_grabit.png" 
                          alt="GRABIT"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">GRABIT</h3>
                        <Badge 
                          className="mt-1 text-xs"
                          style={{ 
                            backgroundColor: grabitStatus === 'connected' ? '#10b981' : grabitStatus === 'connecting' ? '#f59e0b' : '#6b7280',
                            color: 'white'
                          }}
                        >
                          {grabitStatus === 'connected' ? 'Conectado' : grabitStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                        </Badge>
                      </div>
                    </div>
                    <Switch 
                      checked={grabitEnabled}
                      onCheckedChange={handleGrabitToggle}
                      disabled={grabitStatus === 'connecting'}
                    />
                  </div>

                  {/* Progress Steps */}
                  {grabitProgress.length > 0 && (
                    <div className="space-y-3 mt-6 border-t pt-4">
                      {grabitProgress.map((step, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 animate-fade-in"
                          style={{
                            animation: `fadeIn 0.5s ease-in`,
                            opacity: 1
                          }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.final ? 'bg-green-500' : 'bg-blue-500'
                          }`}>
                            <step.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className={`text-sm font-medium ${
                            step.final ? 'text-green-600' : 'text-gray-700'
                          }`}>
                            {step.text}
                          </span>
                          {!step.final && (
                            <div className="ml-auto">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* EDGIFY Card */}
                <Card className="p-6 border-2 transition-all" style={{ 
                  borderColor: edgifyStatus === 'connected' ? '#10b981' : edgifyStatus === 'connecting' ? '#f59e0b' : '#e5e7eb',
                  backgroundColor: edgifyStatus === 'connected' ? 'rgba(16, 185, 129, 0.05)' : 'white'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white p-2 shadow-md">
                        <img 
                          src="https://customer-assets.emergentagent.com/job_bm-intelligence/artifacts/4yy14ssw_edgify.png" 
                          alt="EDGIFY"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">EDGIFY</h3>
                        <Badge 
                          className="mt-1 text-xs"
                          style={{ 
                            backgroundColor: edgifyStatus === 'connected' ? '#10b981' : edgifyStatus === 'connecting' ? '#f59e0b' : '#6b7280',
                            color: 'white'
                          }}
                        >
                          {edgifyStatus === 'connected' ? 'Conectado' : edgifyStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                        </Badge>
                      </div>
                    </div>
                    <Switch 
                      checked={edgifyEnabled}
                      onCheckedChange={handleEdgifyToggle}
                      disabled={edgifyStatus === 'connecting'}
                    />
                  </div>

                  {/* Progress Steps */}
                  {edgifyProgress.length > 0 && (
                    <div className="space-y-3 mt-6 border-t pt-4">
                      {edgifyProgress.map((step, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 animate-fade-in"
                          style={{
                            animation: `fadeIn 0.5s ease-in`,
                            opacity: 1
                          }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.final ? 'bg-green-500' : 'bg-purple-500'
                          }`}>
                            <step.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className={`text-sm font-medium ${
                            step.final ? 'text-green-600' : 'text-gray-700'
                          }`}>
                            {step.text}
                          </span>
                          {!step.final && (
                            <div className="ml-auto">
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Info Box */}
              {(grabitStatus === 'connected' || edgifyStatus === 'connected') && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Servicios de IA Activos</p>
                      <p className="text-xs text-green-700 mt-1">
                        Los vendors conectados están distribuyendo servicios LLM y MPC a los assets de Walmart en tiempo real.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Licencias Activas</p>
                <h3 className="text-3xl font-bold text-green-600">
                  {allDevices.filter(d => d.licenseStatus === 'active').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Licencias Pendientes</p>
                <h3 className="text-3xl font-bold text-amber-600">
                  {allDevices.filter(d => d.licenseStatus === 'pending').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Proveedores</p>
                <h3 className="text-3xl font-bold" style={{ color: '#0071CE' }}>2</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 113, 206, 0.1)' }}>
                <HardDrive className="w-6 h-6" style={{ color: '#0071CE' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Instalaciones 2025</p>
                <h3 className="text-3xl font-bold" style={{ color: '#FFC220' }}>
                  {allDevices.filter(d => d.installation_date.startsWith('2025')).length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 194, 32, 0.1)' }}>
                <Calendar className="w-6 h-6" style={{ color: '#FFC220' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Buscar por número de serie, local, tipo o proveedor..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Assets Table */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Registro de Activos ({filteredDevices.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Número de Serie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Fecha Instalación</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Licencia</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Garantía</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.slice(0, 50).map((device) => (
                  <tr key={device.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs font-semibold whitespace-nowrap" style={{ color: '#0071CE' }}>
                        {device.serialNumber}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-sm text-gray-800 whitespace-nowrap">{device.storeName} - {device.storeComuna}</p>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge 
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                        style={{
                          borderColor: device.type === 'IA' ? '#0071CE' : '#FFC220',
                          color: device.type === 'IA' ? '#0071CE' : '#FFC220'
                        }}
                      >
                        {device.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      {new Date(device.installation_date).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">{device.provider}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge 
                        className="text-xs whitespace-nowrap"
                        style={{
                          backgroundColor: device.licenseStatus === 'active' ? '#10b981' : '#f59e0b',
                          color: 'white'
                        }}
                      >
                        {device.licenseStatus === 'active' ? 'Activa' : 'Pendiente'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      {device.warrantyExpiry}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AssetPage;