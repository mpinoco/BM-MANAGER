import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Brain, Shield, TrendingUp, AlertTriangle, MapPin, Calendar, 
  Download, Settings, CheckCircle, XCircle, DollarSign, Target,
  Zap, Activity, Eye, RefreshCw, Bell, Filter, Search
} from 'lucide-react';
import { toast } from 'sonner';

const AIConnectorsPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedDeviceType, setSelectedDeviceType] = useState('all');
  const [fraudType, setFraudType] = useState('all');
  
  // AI Connectors Configuration
  const [connectors, setConnectors] = useState({
    gravit: {
      enabled: true,
      apiKey: 'grav_4f8a9b2c1e7d6543',
      endpoint: 'https://api.gravit.ai/v2/fraud-detection',
      status: 'connected',
      lastSync: '2025-01-10T14:30:00Z'
    },
    edgify: {
      enabled: true,
      apiKey: 'edge_9d8c7b6a5f4e3210',
      endpoint: 'https://edgify-api.com/v1/analytics',
      status: 'connected',
      lastSync: '2025-01-10T14:28:00Z'
    }
  });

  // Fraud Events Data (Simulated Real-Time Data)
  const [fraudEvents, setFraudEvents] = useState([]);
  const [fraudStats, setFraudStats] = useState({});
  const [predictiveModel, setPredictiveModel] = useState({});

  useEffect(() => {
    loadData();
    generateFraudData();
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(generateFraudData, 30000);
    return () => clearInterval(interval);
  }, [dateRange, selectedStore, selectedDeviceType, fraudType]);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const generateFraudData = () => {
    const days = parseInt(dateRange);
    const events = [];
    const fraudTypes = [
      'no-scan', 'mis-scan', 'weight-manipulation', 'barcode-swap', 
      'partial-scan', 'item-substitution', 'bulk-fraud'
    ];
    const deviceTypes = ['balance', 'sco', 'pos'];
    
    // Generate fraud events for the selected period
    for (let i = 0; i < days; i++) {
      const eventsPerDay = Math.floor(Math.random() * 8) + 2; // 2-10 events per day
      
      for (let j = 0; j < eventsPerDay; j++) {
        const store = stores[Math.floor(Math.random() * stores.length)];
        if (!store) continue;
        
        const fraudType = fraudTypes[Math.floor(Math.random() * fraudTypes.length)];
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const productNames = [
          'Palta Hass Premium', 'Manzanas Gala', 'Plátanos Orgánicos', 'Tomates Cherry',
          'Queso Gouda', 'Salmón Fresco', 'Pan Integral', 'Yogurt Griego',
          'Aceite de Oliva', 'Vino Tinto Reserva', 'Chocolate Premium', 'Café Gourmet'
        ];
        
        const event = {
          id: `fraud_${Date.now()}_${j}_${i}`,
          timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + (j * 60 * 60 * 1000)).toISOString(),
          fraudType,
          deviceType,
          deviceId: `${deviceType.toUpperCase()}-${Math.random().toString(36).substr(2, 6)}`,
          storeId: store.id,
          storeName: store.name,
          comuna: store.comuna,
          productName: productNames[Math.floor(Math.random() * productNames.length)],
          productCode: `SKU${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          estimatedValue: Math.floor(Math.random() * 15000) + 1000, // CLP
          operator: `Operador ${Math.floor(Math.random() * 20) + 1}`,
          confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
          source: Math.random() > 0.5 ? 'gravit' : 'edgify',
          prevented: Math.random() > 0.2 // 80% prevention rate
        };
        
        events.push(event);
      }
    }
    
    // Apply filters
    let filteredEvents = events;
    
    if (selectedStore !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.storeId === selectedStore);
    }
    
    if (selectedDeviceType !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.deviceType === selectedDeviceType);
    }
    
    if (fraudType !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.fraudType === fraudType);
    }
    
    setFraudEvents(filteredEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    calculateFraudStats(filteredEvents);
    generatePredictiveModel(filteredEvents);
  };

  const calculateFraudStats = (events) => {
    const totalEvents = events.length;
    const preventedEvents = events.filter(e => e.prevented).length;
    const totalSavings = events.filter(e => e.prevented).reduce((sum, e) => sum + e.estimatedValue, 0);
    
    // Calculate trends
    const dailyTrends = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyTrends[date] = (dailyTrends[date] || 0) + 1;
    });
    
    // Top products with fraud
    const productFraud = {};
    events.forEach(event => {
      productFraud[event.productName] = (productFraud[event.productName] || 0) + 1;
    });
    
    const topProducts = Object.entries(productFraud)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    // Top stores with fraud
    const storeFraud = {};
    events.forEach(event => {
      const key = `${event.storeName} - ${event.comuna}`;
      storeFraud[key] = (storeFraud[key] || 0) + 1;
    });
    
    const topStores = Object.entries(storeFraud)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    // Device type distribution
    const deviceDistribution = {};
    events.forEach(event => {
      deviceDistribution[event.deviceType] = (deviceDistribution[event.deviceType] || 0) + 1;
    });
    
    // ROI Calculation (based on Edgify metrics)
    const monthlySubscriptionCost = 45000000; // CLP (estimated)
    const monthlyEvents = events.length * (30 / parseInt(dateRange));
    const monthlySavings = totalSavings * (30 / parseInt(dateRange));
    const roi = ((monthlySavings - monthlySubscriptionCost) / monthlySubscriptionCost) * 100;
    
    setFraudStats({
      totalEvents,
      preventedEvents,
      preventionRate: ((preventedEvents / totalEvents) * 100).toFixed(1),
      totalSavings,
      monthlySavings,
      dailyTrends: Object.entries(dailyTrends).map(([date, count]) => ({ date, count })),
      topProducts,
      topStores,
      deviceDistribution: Object.entries(deviceDistribution).map(([type, count]) => ({ type, count })),
      roi: roi.toFixed(1),
      avgFraudValue: (totalSavings / totalEvents).toFixed(0)
    });
  };

  const generatePredictiveModel = (events) => {
    // Simple linear regression for fraud prediction
    const dailyData = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });
    
    const sortedDates = Object.keys(dailyData).sort();
    const values = sortedDates.map(date => dailyData[date]);
    
    // Calculate trend
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * (index + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate predictions for next 7 days
    const predictions = [];
    for (let i = 1; i <= 7; i++) {
      const predictedValue = Math.max(0, Math.round(slope * (n + i) + intercept));
      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted: predictedValue,
        confidence: Math.max(60, 95 - i * 5) // Decreasing confidence
      });
    }
    
    setPredictiveModel({
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      predictions,
      accuracy: 87.3 // Simulated model accuracy
    });
  };

  const testConnection = async (provider) => {
    toast.info(`Probando conexión con ${provider.toUpperCase()}...`);
    
    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      if (success) {
        toast.success(`✅ Conexión exitosa con ${provider.toUpperCase()}`);
        setConnectors(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            status: 'connected',
            lastSync: new Date().toISOString()
          }
        }));
      } else {
        toast.error(`❌ Error de conexión con ${provider.toUpperCase()}`);
        setConnectors(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            status: 'error'
          }
        }));
      }
    }, 2000);
  };

  const exportReport = (format) => {
    toast.success(`Exportando reporte en formato ${format.toUpperCase()}...`);
    // In a real implementation, this would generate and download the report
  };

  const COLORS = ['#0071CE', '#FFC220', '#1B4D89', '#FF6B6B', '#4ECDC4'];
  
  const getFraudTypeLabel = (type) => {
    const labels = {
      'no-scan': 'No Escaneado',
      'mis-scan': 'Escaneo Incorrecto', 
      'weight-manipulation': 'Manipulación de Peso',
      'barcode-swap': 'Cambio de Código',
      'partial-scan': 'Escaneo Parcial',
      'item-substitution': 'Sustitución de Producto',
      'bulk-fraud': 'Fraude Masivo'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              Conectores IA (Gravit & Edgify)
            </h1>
            <p className="text-gray-600 mt-1">Detección de fraude en tiempo real con análisis predictivo</p>
            
            {/* Impact Summary */}
            <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-800">
                <strong className="text-green-700">🎯 Impacto en 30 días:</strong> La IA ha detectado{' '}
                <span className="font-bold text-blue-600">{fraudStats.totalEvents || 0} intentos de fraude</span>, 
                evitando pérdidas estimadas en{' '}
                <span className="font-bold text-green-600">
                  ${(fraudStats.totalSavings || 0).toLocaleString('es-CL')} CLP
                </span>. 
                Esto equivale a un ahorro del{' '}
                <span className="font-bold text-purple-600">{fraudStats.preventionRate || 0}%</span>{' '}
                frente al escenario sin Gravit ni Edgify.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              className={`px-4 py-2 ${connectors.gravit.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Gravit: {connectors.gravit.status === 'connected' ? 'Conectado' : 'Error'}
            </Badge>
            <Badge 
              className={`px-4 py-2 ${connectors.edgify.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Edgify: {connectors.edgify.status === 'connected' ? 'Conectado' : 'Error'}
            </Badge>
            <Button onClick={() => generateFraudData()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-sm font-medium">Período</Label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
              </select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Local</Label>
              <select 
                value={selectedStore} 
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Todos los locales</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.comuna}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Tipo de Dispositivo</Label>
              <select 
                value={selectedDeviceType} 
                onChange={(e) => setSelectedDeviceType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Todos</option>
                <option value="balance">Balanzas</option>
                <option value="sco">Self-Checkout</option>
                <option value="pos">POS Tradicional</option>
              </select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Tipo de Fraude</Label>
              <select 
                value={fraudType} 
                onChange={(e) => setFraudType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="no-scan">No Escaneado</option>
                <option value="mis-scan">Escaneo Incorrecto</option>
                <option value="weight-manipulation">Manipulación de Peso</option>
                <option value="barcode-swap">Cambio de Código</option>
              </select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={() => exportReport('pdf')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => exportReport('excel')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="predictions">Predicciones</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fraudes Detectados</p>
                    <p className="text-3xl font-bold text-red-600">{fraudStats.totalEvents || 0}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {fraudStats.preventionRate || 0}% prevenidos
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ahorro Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(fraudStats.totalSavings || 0).toLocaleString('es-CL')}
                    </p>
                    <p className="text-xs text-gray-600">CLP en {dateRange} días</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI Estimado</p>
                    <p className="text-3xl font-bold text-blue-600">{fraudStats.roi || 0}%</p>
                    <p className="text-xs text-blue-600">Retorno mensual</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${fraudStats.avgFraudValue || 0}
                    </p>
                    <p className="text-xs text-gray-600">CLP por evento</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Fraud Trends and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Tendencia de Fraudes (Últimos {dateRange} días)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fraudStats.dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0071CE" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Top 10 Productos con Mayor Fraude
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fraudStats.topProducts || []} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFC220" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Top Stores and Device Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Locales con Mayor Incidencia
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fraudStats.topStores || []} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1B4D89" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Distribución por Tipo de Dispositivo
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fraudStats.deviceDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type.toUpperCase()}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(fraudStats.deviceDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Recent Fraud Events */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                Eventos Recientes de Fraude
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Fecha/Hora</th>
                      <th className="text-left p-3">Local</th>
                      <th className="text-left p-3">Producto</th>
                      <th className="text-left p-3">Tipo de Fraude</th>
                      <th className="text-left p-3">Dispositivo</th>
                      <th className="text-left p-3">Valor</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Fuente IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudEvents.slice(0, 10).map(event => (
                      <tr key={event.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">
                              {new Date(event.timestamp).toLocaleDateString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(event.timestamp).toLocaleTimeString('es-CL')}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{event.storeName}</p>
                            <p className="text-xs text-gray-600">{event.comuna}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{event.productName}</p>
                            <p className="text-xs text-gray-600">{event.productCode}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {getFraudTypeLabel(event.fraudType)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{event.deviceId}</p>
                            <p className="text-xs text-gray-600">{event.deviceType.toUpperCase()}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-green-600">
                            ${event.estimatedValue.toLocaleString('es-CL')}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge className={event.prevented ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {event.prevented ? 'Prevenido' : 'No Detectado'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={event.source === 'gravit' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                            {event.source.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 text-center">Métricas de Edgify</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">65%</p>
                    <p className="text-sm text-gray-600">Reducción de Pérdidas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">85%</p>
                    <p className="text-sm text-gray-600">Reducción Tiempo Transacción</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">98%</p>
                    <p className="text-sm text-gray-600">Precisión de Detección</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 text-center">Comparativa Mensual</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sin IA</span>
                    <span className="font-bold text-red-600">$125M CLP pérdidas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Con Gravit + Edgify</span>
                    <span className="font-bold text-green-600">$44M CLP pérdidas</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Ahorro Neto</span>
                    <span className="font-bold text-blue-600">$81M CLP</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 text-center">ROI Análisis</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{fraudStats.roi}%</p>
                    <p className="text-sm text-gray-600">ROI Mensual</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">4.2x</p>
                    <p className="text-sm text-gray-600">Retorno de Inversión</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">18 meses</p>
                    <p className="text-sm text-gray-600">Tiempo de Recuperación</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Evolución del Fraude por Hora</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={Array.from({length: 24}, (_, i) => ({
                    hour: i,
                    frauds: Math.floor(Math.random() * 10) + (i >= 9 && i <= 21 ? 15 : 5)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="frauds" stroke="#0071CE" fill="#0071CE" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Efectividad por Tipo de Fraude</h3>
                <div className="space-y-3">
                  {[
                    { type: 'No Escaneado', detection: 94, prevention: 87 },
                    { type: 'Manipulación Peso', detection: 89, prevention: 82 },
                    { type: 'Cambio Código', detection: 96, prevention: 91 },
                    { type: 'Escaneo Incorrecto', detection: 85, prevention: 78 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.type}</span>
                        <span>{item.detection}% detección</span>
                      </div>
                      <Progress value={item.detection} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Modelo Predictivo
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{predictiveModel.accuracy}%</p>
                    <p className="text-sm text-gray-600">Precisión del Modelo</p>
                  </div>
                  <div className="text-center">
                    <Badge className={`${
                      predictiveModel.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                      predictiveModel.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Tendencia: {
                        predictiveModel.trend === 'increasing' ? 'Ascendente' :
                        predictiveModel.trend === 'decreasing' ? 'Descendente' : 'Estable'
                      }
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Predicción de Fraudes - Próximos 7 Días</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictiveModel.predictions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#9333EA" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Prediction Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detalles de Predicción</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-left p-3">Fraudes Predichos</th>
                      <th className="text-left p-3">Confianza</th>
                      <th className="text-left p-3">Valor Estimado</th>
                      <th className="text-left p-3">Recomendación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(predictiveModel.predictions || []).map((pred, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          {new Date(pred.date).toLocaleDateString('es-CL')}
                        </td>
                        <td className="p-3">{pred.predicted}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={pred.confidence} className="w-16 h-2" />
                            <span>{pred.confidence}%</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-orange-600">
                          ${(pred.predicted * 3200).toLocaleString('es-CL')} CLP
                        </td>
                        <td className="p-3">
                          {pred.predicted > 8 ? (
                            <Badge className="bg-red-100 text-red-800">Reforzar Vigilancia</Badge>
                          ) : pred.predicted > 4 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Monitoreo Normal</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Bajo Riesgo</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gravit Configuration */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Configuración Gravit
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {connectors.gravit.status === 'connected' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={connectors.gravit.status === 'connected' ? 'text-green-600' : 'text-red-600'}>
                        {connectors.gravit.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="gravit-api-key" className="text-sm font-medium">
                      API Key
                    </Label>
                    <Input
                      id="gravit-api-key"
                      type="password"
                      value={connectors.gravit.apiKey}
                      onChange={(e) => setConnectors(prev => ({
                        ...prev,
                        gravit: { ...prev.gravit, apiKey: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gravit-endpoint" className="text-sm font-medium">
                      Endpoint URL
                    </Label>
                    <Input
                      id="gravit-endpoint"
                      value={connectors.gravit.endpoint}
                      onChange={(e) => setConnectors(prev => ({
                        ...prev,
                        gravit: { ...prev.gravit, endpoint: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Última Sincronización</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(connectors.gravit.lastSync).toLocaleString('es-CL')}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => testConnection('gravit')} 
                    className="w-full"
                    style={{ backgroundColor: '#0071CE' }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Probar Conexión
                  </Button>
                </div>
              </Card>

              {/* Edgify Configuration */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Configuración Edgify
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {connectors.edgify.status === 'connected' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={connectors.edgify.status === 'connected' ? 'text-green-600' : 'text-red-600'}>
                        {connectors.edgify.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edgify-api-key" className="text-sm font-medium">
                      API Key
                    </Label>
                    <Input
                      id="edgify-api-key"
                      type="password"
                      value={connectors.edgify.apiKey}
                      onChange={(e) => setConnectors(prev => ({
                        ...prev,
                        edgify: { ...prev.edgify, apiKey: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edgify-endpoint" className="text-sm font-medium">
                      Endpoint URL
                    </Label>
                    <Input
                      id="edgify-endpoint"
                      value={connectors.edgify.endpoint}
                      onChange={(e) => setConnectors(prev => ({
                        ...prev,
                        edgify: { ...prev.edgify, endpoint: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Última Sincronización</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(connectors.edgify.lastSync).toLocaleString('es-CL')}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => testConnection('edgify')} 
                    className="w-full"
                    style={{ backgroundColor: '#9333EA' }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Probar Conexión
                  </Button>
                </div>
              </Card>
            </div>

            {/* Alert Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Configuración de Alertas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Umbral de Fraudes por Hora</Label>
                  <Input type="number" defaultValue="5" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Valor Mínimo de Alerta (CLP)</Label>
                  <Input type="number" defaultValue="50000" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Destinatarios WhatsApp</Label>
                  <Input placeholder="+56 9 xxxx xxxx" className="mt-1" />
                </div>
              </div>
              
              <div className="mt-4">
                <Button style={{ backgroundColor: '#25D366', color: 'white' }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Configurar Alertas WhatsApp
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AIConnectorsPage;