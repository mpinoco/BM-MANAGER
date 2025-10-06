import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Scale, AlertCircle, CheckCircle2, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DashboardPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [weightData, setWeightData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storesRes, metricsRes, weightRes, alertsRes] = await Promise.all([
        axios.get(`${API}/stores`),
        axios.get(`${API}/metrics`),
        axios.get(`${API}/weight-data`),
        axios.get(`${API}/alerts`)
      ]);
      
      setStores(storesRes.data);
      setMetrics(metricsRes.data);
      setWeightData(weightRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.comuna.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.sap_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || store.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Prepare chart data
  const statusData = metrics ? [
    { name: 'En línea', value: metrics.stores_online, color: '#10b981' },
    { name: 'Parcial', value: metrics.stores_partial, color: '#f59e0b' },
    { name: 'Offline', value: metrics.stores_offline, color: '#ef4444' }
  ] : [];

  const topStoresIA = stores
    .sort((a, b) => b.balances_ia - a.balances_ia)
    .slice(0, 3)
    .map(s => ({ name: s.comuna, balances: s.balances_ia }));

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Panel de Control</h1>
            <p className="text-gray-600 mt-1">Vista general del sistema de balanzas</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kilos Pesados Hoy</p>
                <h3 className="text-3xl font-bold" style={{ color: '#79b9e7' }}>
                  {metrics?.total_kg_today.toLocaleString()}
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(121, 185, 231, 0.1)' }}>
                <Scale className="w-7 h-7" style={{ color: '#79b9e7' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balanzas Activas</p>
                <h3 className="text-3xl font-bold text-green-600">{metrics?.active_balances}</h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">% Calibradas</p>
                <h3 className="text-3xl font-bold" style={{ color: '#f47421' }}>
                  {metrics?.calibration_percentage}%
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(244, 116, 33, 0.1)' }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: '#f47421' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actualizaciones Pendientes</p>
                <h3 className="text-3xl font-bold text-amber-600">{metrics?.pending_updates}</h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Pie Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Estado de Locales</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top IA Stores */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Top 3 Locales con Balanzas IA</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topStoresIA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="balances" fill="#79b9e7" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Weight Trends */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Peso Promedio Semanal - Productos Clave</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" data={weightData[0]?.dates.map((d, i) => ({ date: d }))} />
              <YAxis label={{ value: 'Kg', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {weightData.map((product, idx) => (
                <Line 
                  key={product.product}
                  data={product.weights.map((w, i) => ({ date: product.dates[i], value: w }))}
                  type="monotone" 
                  dataKey="value" 
                  name={product.product}
                  stroke={['#10b981', '#f59e0b', '#79b9e7'][idx]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Alertas y Notificaciones
            </h3>
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{alert.store_name}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <Badge variant={alert.priority === 'high' ? 'destructive' : 'default'}>
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Stores Table */}
        <Card className="p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Locales ({filteredStores.length})</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Buscar local, comuna o código SAP..."
                  className="pl-10 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 border rounded-lg"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="online">En línea</option>
                <option value="partial">Parcial</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código SAP</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">BMS Asistida</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Autoservicio</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Balanzas IA</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((store, idx) => (
                  <tr key={store.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">{store.name}</p>
                        <p className="text-sm text-gray-600">{store.comuna}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{store.sap_code}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">{store.balances_bms}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">{store.balances_autoservicio}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge style={{ backgroundColor: '#79b9e7', color: 'white' }}>{store.balances_ia}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full status-${store.status}`} />
                        <span className="text-sm capitalize">{store.status === 'online' ? 'En línea' : store.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/store/${store.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;