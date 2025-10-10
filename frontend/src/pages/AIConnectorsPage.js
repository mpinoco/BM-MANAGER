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
  Zap, Activity, Eye, RefreshCw, Bell, Filter, Search, MessageSquare
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
    
    // High-value fraud products with real imagery and pricing
    const fraudProductImages = {
      'Whisky Premium Johnnie Walker': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop',
      'iPhone 15 Pro Max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop', 
      'Perfume Chanel No.5': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=400&h=300&fit=crop',
      'Reloj Apple Watch Ultra': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop',
      'Auriculares Sony WH-1000XM5': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      'Chocolate Lindt Excellence': 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=400&h=300&fit=crop',
      'Vino Tinto Reserva Especial': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&fit=crop',
      'Queso Manchego Artesanal': 'https://images.unsplash.com/photo-1486297678162-eb2a19b44847?w=400&h=300&fit=crop',
      'Aceite de Oliva Extra Virgen': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop',
      'Salmón Premium Noruego': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      'Carne Wagyu A5': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      'Champagne Dom Pérignon': 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=300&fit=crop'
    };

    const productNames = Object.keys(fraudProductImages);
    const productPrices = {
      'Whisky Premium Johnnie Walker': 89000,
      'iPhone 15 Pro Max': 1200000,
      'Perfume Chanel No.5': 125000,
      'Reloj Apple Watch Ultra': 650000,
      'Auriculares Sony WH-1000XM5': 280000,
      'Chocolate Lindt Excellence': 8500,
      'Vino Tinto Reserva Especial': 45000,
      'Queso Manchego Artesanal': 15600,
      'Aceite de Oliva Extra Virgen': 12000,
      'Salmón Premium Noruego': 18500,
      'Carne Wagyu A5': 150000,
      'Champagne Dom Pérignon': 320000
    };

    // Generate fraud events for the selected period
    for (let i = 0; i < days; i++) {
      const eventsPerDay = Math.floor(Math.random() * 15) + 8; // 8-23 events per day (more realistic)
      
      for (let j = 0; j < eventsPerDay; j++) {
        const store = stores[Math.floor(Math.random() * stores.length)];
        if (!store) continue;
        
        const fraudType = fraudTypes[Math.floor(Math.random() * fraudTypes.length)];
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const productName = productNames[Math.floor(Math.random() * productNames.length)];
        
        const event = {
          id: `fraud_${Date.now()}_${j}_${i}`,
          timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + (j * 60 * 60 * 1000)).toISOString(),
          fraudType,
          deviceType,
          deviceId: `${deviceType.toUpperCase()}-${Math.random().toString(36).substr(2, 6)}`,
          storeId: store.id,
          storeName: store.name,
          comuna: store.comuna,
          productName: productName,
          productImage: fraudProductImages[productName],
          productCode: `SKU${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          estimatedValue: productPrices[productName] || Math.floor(Math.random() * 15000) + 1000, // CLP
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
    
    // Calculate hourly trends for business insights
    const hourlyTrends = {};
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyTrends[hour] = (hourlyTrends[hour] || 0) + 1;
    });
    
    // Calculate daily trends
    const dailyTrends = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyTrends[date] = (dailyTrends[date] || {count: 0, value: 0});
      dailyTrends[date].count += 1;
      dailyTrends[date].value += event.estimatedValue;
    });
    
    // Top high-value products with images and pricing
    const productFraud = {};
    const productValues = {};
    const productImages = {};
    events.forEach(event => {
      productFraud[event.productName] = (productFraud[event.productName] || 0) + 1;
      productValues[event.productName] = (productValues[event.productName] || 0) + event.estimatedValue;
      if (!productImages[event.productName] && event.productImage) {
        productImages[event.productName] = event.productImage;
      }
    });
    
    const topProducts = Object.entries(productFraud)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ 
        name, 
        count, 
        totalValue: productValues[name],
        avgValue: Math.round(productValues[name] / count),
        image: productImages[name]
      }));
    
    // Comuna analysis for Santiago metropolitan area
    const comunaFraud = {};
    const comunaValues = {};
    events.forEach(event => {
      comunaFraud[event.comuna] = (comunaFraud[event.comuna] || 0) + 1;
      comunaValues[event.comuna] = (comunaValues[event.comuna] || 0) + event.estimatedValue;
    });
    
    const topComunas = Object.entries(comunaFraud)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([comuna, count]) => ({ 
        comuna, 
        count, 
        totalValue: comunaValues[comuna],
        avgValue: Math.round(comunaValues[comuna] / count),
        riskScore: Math.min(100, (count / totalEvents) * 1000)
      }));
    
    // Store performance with predictive indicators
    const storeFraud = {};
    const storeValues = {};
    const storeDevices = {};
    events.forEach(event => {
      const key = `${event.storeName} - ${event.comuna}`;
      storeFraud[key] = (storeFraud[key] || 0) + 1;
      storeValues[key] = (storeValues[key] || 0) + event.estimatedValue;
      storeDevices[key] = storeDevices[key] || new Set();
      storeDevices[key].add(event.deviceType);
    });
    
    const topStores = Object.entries(storeFraud)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({ 
        name, 
        count, 
        totalValue: storeValues[name],
        avgValue: Math.round(storeValues[name] / count),
        deviceTypes: Array.from(storeDevices[name]).length,
        riskLevel: count > (totalEvents * 0.08) ? 'Alto' : count > (totalEvents * 0.05) ? 'Medio' : 'Bajo',
        predictedNext7Days: Math.round(count * 1.15) // 15% increase trend
      }));
    
    // Advanced device analysis
    const deviceDistribution = {};
    const deviceValues = {};
    events.forEach(event => {
      deviceDistribution[event.deviceType] = (deviceDistribution[event.deviceType] || 0) + 1;
      deviceValues[event.deviceType] = (deviceValues[event.deviceType] || 0) + event.estimatedValue;
    });
    
    // Financial impact analysis
    const monthlySubscriptionCost = 85000000; // CLP (Gravit + Edgify combined)
    const monthlyEvents = events.length * (30 / parseInt(dateRange));
    const monthlySavings = totalSavings * (30 / parseInt(dateRange));
    const roi = ((monthlySavings - monthlySubscriptionCost) / monthlySubscriptionCost) * 100;
    const lossWithoutAI = monthlyEvents * 0.75 * (totalSavings / preventedEvents); // Assuming 75% would be successful without AI
    const netImpact = monthlySavings - monthlySubscriptionCost;
    
    // Predictive insights
    const avgDailyFrauds = Object.values(dailyTrends).reduce((sum, day) => sum + day.count, 0) / Object.keys(dailyTrends).length;
    const trendDirection = avgDailyFrauds > (totalEvents / parseInt(dateRange)) ? 'Aumentando' : 'Disminuyendo';
    
    setFraudStats({
      totalEvents,
      preventedEvents,
      preventionRate: ((preventedEvents / totalEvents) * 100).toFixed(1),
      totalSavings,
      monthlySavings,
      monthlySubscriptionCost,
      lossWithoutAI,
      netImpact,
      dailyTrends: Object.entries(dailyTrends).map(([date, data]) => ({ 
        date: date.split('-').slice(1).join('/'), 
        count: data.count, 
        value: data.value,
        savings: data.value * 0.8 // 80% prevention rate
      })),
      hourlyTrends: Object.entries(hourlyTrends).map(([hour, count]) => ({ hour: `${hour}:00`, count })),
      topProducts,
      topStores,
      topComunas,
      deviceDistribution: Object.entries(deviceDistribution).map(([type, count]) => ({ 
        type: type.toUpperCase(), 
        count,
        totalValue: deviceValues[type],
        avgValue: Math.round(deviceValues[type] / count)
      })),
      roi: roi.toFixed(1),
      avgFraudValue: (totalSavings / totalEvents).toFixed(0),
      trendDirection,
      avgDailyFrauds: avgDailyFrauds.toFixed(1),
      // Advanced business metrics
      fraudDetectionAccuracy: 96.8,
      falsePositiveRate: 2.1,
      operationalEfficiency: 94.5,
      customerSatisfactionImpact: 97.2
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="financial">Análisis Financiero</TabsTrigger>
            <TabsTrigger value="products">Productos & Fraudes</TabsTrigger>
            <TabsTrigger value="locations">Análisis Geográfico</TabsTrigger>
            <TabsTrigger value="predictions">Predicciones</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fraudes Detectados</p>
                    <p className="text-3xl font-bold text-red-700">{fraudStats.totalEvents || 0}</p>
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {fraudStats.preventionRate || 0}% tasa prevención
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Tendencia: {fraudStats.trendDirection || 'Estable'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-700" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ahorro Total</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${(fraudStats.totalSavings || 0).toLocaleString('es-CL')}
                    </p>
                    <p className="text-xs text-gray-600">CLP en {dateRange} días</p>
                    <p className="text-xs text-green-700 font-medium mt-1">
                      Impacto neto: ${((fraudStats.netImpact || 0) / 1000000).toFixed(1)}M/mes
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">ROI Anual</p>
                    <p className="text-3xl font-bold text-blue-700">{fraudStats.roi || 0}%</p>
                    <p className="text-xs text-blue-700">Gravit + Edgify</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Precisión IA: {fraudStats.fraudDetectionAccuracy || 96.8}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Eficiencia Operacional</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {fraudStats.operationalEfficiency || 94.5}%
                    </p>
                    <p className="text-xs text-purple-700">Sistemas integrados</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Satisfacción cliente: {fraudStats.customerSatisfactionImpact || 97.2}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Real-Time Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Tendencia de Detección (Últimos {dateRange} días)
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={fraudStats.dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'count' ? `${value} fraudes` : `$${value?.toLocaleString('es-CL')} CLP`,
                      name === 'count' ? 'Fraudes Detectados' : name === 'value' ? 'Valor Total' : 'Ahorro Estimado'
                    ]} />
                    <Area type="monotone" dataKey="count" stackId="1" stroke="#0071CE" fill="#0071CE" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="savings" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Patrón Horario de Fraudes
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={fraudStats.hourlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} fraudes`, 'Fraudes por Hora']} />
                    <Bar dataKey="count" fill="#FFC220" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Insight:</strong> Picos de fraude entre 14:00-18:00 (horario de mayor tráfico) 
                    y 20:00-22:00 (menos supervisión).
                  </p>
                </div>
              </Card>
            </div>

            {/* Device Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Distribución por Dispositivo
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={fraudStats.deviceDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(fraudStats.deviceDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} fraudes`, 'Cantidad']} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Locales de Alto Riesgo (Top 8)
                </h3>
                <div className="space-y-3">
                  {(fraudStats.topStores || []).slice(0, 8).map((store, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          store.riskLevel === 'Alto' ? 'bg-red-500' :
                          store.riskLevel === 'Medio' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">{store.name}</p>
                          <p className="text-xs text-gray-600">{store.count} fraudes • ${store.totalValue?.toLocaleString('es-CL')} CLP</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${
                          store.riskLevel === 'Alto' ? 'bg-red-100 text-red-700' :
                          store.riskLevel === 'Medio' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {store.riskLevel}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          Predicción 7 días: {store.predictedNext7Days}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

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

          {/* Financial Analysis Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* ROI Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Análisis de Retorno de Inversión
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">Ahorro Mensual</p>
                      <p className="text-2xl font-bold text-green-800">
                        ${((fraudStats.monthlySavings || 0) / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-green-600">CLP por mes</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">Costo Suscripción</p>
                      <p className="text-2xl font-bold text-red-800">
                        ${((fraudStats.monthlySubscriptionCost || 0) / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-red-600">CLP por mes</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">Impacto Neto Mensual</p>
                    <p className="text-3xl font-bold text-blue-800">
                      ${((fraudStats.netImpact || 0) / 1000000).toFixed(1)}M CLP
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      ROI: <span className="font-bold">{fraudStats.roi}%</span> • 
                      Payback: <span className="font-bold">4.2 meses</span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">ROI Ejecutivo</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Resumen Ejecutivo</h4>
                    <p className="text-sm text-gray-700">
                      La inversión en sistemas de IA para detección de fraudes genera un retorno del{' '}
                      <span className="font-bold text-blue-600">{fraudStats.roi}%</span> anual.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Products & Fraud Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Top Fraud Products with Images */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Productos Más Utilizados para Fraude (Con Imágenes)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(fraudStats.topProducts || []).map((product, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm" style={{ display: product.image ? 'none' : 'flex' }}>
                        Imagen del producto
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Intentos de fraude:</span>
                          <span className="font-bold text-red-600">{product.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor promedio:</span>
                          <span className="font-bold text-green-600">
                            ${product.avgValue?.toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pérdida potencial:</span>
                          <span className="font-bold text-orange-600">
                            ${product.totalValue?.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge className={`w-full text-center justify-center ${
                          index < 2 ? 'bg-red-100 text-red-800' :
                          index < 5 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {index < 2 ? 'Riesgo Crítico' : index < 5 ? 'Riesgo Alto' : 'Riesgo Medio'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Fraud Pattern Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Análisis por Tipo de Fraude
                </h3>
                <div className="space-y-4">
                  {[
                    { type: 'No Escaneado', percentage: 34, color: 'bg-red-500', detected: 89, prevented: 76 },
                    { type: 'Manipulación de Peso', percentage: 28, color: 'bg-orange-500', detected: 73, prevented: 68 },
                    { type: 'Cambio de Código', percentage: 22, color: 'bg-yellow-500', detected: 58, prevented: 55 },
                    { type: 'Escaneo Incorrecto', percentage: 16, color: 'bg-blue-500', detected: 42, prevented: 39 }
                  ].map((fraud, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{fraud.type}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{fraud.detected} detectados</span>
                          <Badge className="bg-green-100 text-green-800">
                            {Math.round((fraud.prevented / fraud.detected) * 100)}% prevenidos
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`${fraud.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${fraud.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{fraud.percentage}% del total</span>
                        <span>Valor promedio: $35,400 CLP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Impacto por Categoría de Producto
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={[
                    { category: 'Electrónicos', frauds: 156, value: 89500000, prevented: 142 },
                    { category: 'Licores Premium', frauds: 89, value: 45200000, prevented: 81 },
                    { category: 'Perfumes/Cosméticos', frauds: 67, value: 18900000, prevented: 59 },
                    { category: 'Alimentos Gourmet', frauds: 34, value: 8400000, prevented: 29 },
                    { category: 'Accesorios', frauds: 28, value: 12100000, prevented: 24 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'frauds' ? `${value} fraudes` : 
                      name === 'prevented' ? `${value} prevenidos` :
                      `$${value?.toLocaleString('es-CL')} CLP`,
                      name === 'frauds' ? 'Intentos de Fraude' : 
                      name === 'prevented' ? 'Fraudes Prevenidos' : 'Valor Total'
                    ]} />
                    <Bar dataKey="frauds" fill="#EF4444" name="frauds" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="prevented" fill="#10B981" name="prevented" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Fraud Intelligence Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                Análisis Inteligente de Patrones (IA)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-800 mb-2">Patrones Detectados por Gravit</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Productos electrónicos: 73% de intentos en SCO vs 27% en balanzas</li>
                      <li>• Peak de fraude: viernes 18:00-20:00 (+145% vs promedio)</li>
                      <li>• Correlación: productos >$100k tienen 340% más intentos</li>
                      <li>• Patrón estacional: +28% en diciembre vs promedio anual</li>
                    </ul>
                  </div>

                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <h4 className="font-medium text-purple-800 mb-2">Insights de Edgify Analytics</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Operadores novatos: 2.3x más incidencias no detectadas</li>
                      <li>• Localización: centros comerciales +67% vs locales de calle</li>
                      <li>• Tiempo respuesta: detección <2s reduce fraude exitoso en 89%</li>
                      <li>• Precisión mejora 12% con datos históricos >6 meses</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recomendaciones Automáticas</h4>
                  <div className="space-y-3">
                    {[
                      {
                        priority: 'Alta',
                        action: 'Reforzar supervisión en SCO durante 18:00-20:00',
                        impact: 'Reducción estimada: 23% fraudes',
                        color: 'red'
                      },
                      {
                        priority: 'Media',
                        action: 'Capacitar operadores con <6 meses experiencia',
                        impact: 'Mejora detección: +18%',
                        color: 'orange'
                      },
                      {
                        priority: 'Media',
                        action: 'Implementar alertas para productos >$50k',
                        impact: 'Prevención adicional: $12M/año',
                        color: 'yellow'
                      },
                      {
                        priority: 'Baja',
                        action: 'Optimizar algoritmos para centros comerciales',
                        impact: 'Eficiencia: +7%',
                        color: 'green'
                      }
                    ].map((rec, index) => (
                      <div key={index} className={`p-3 border-l-4 rounded-r ${
                        rec.color === 'red' ? 'border-red-500 bg-red-50' :
                        rec.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                        rec.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                        'border-green-500 bg-green-50'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={`${
                            rec.color === 'red' ? 'bg-red-100 text-red-800' :
                            rec.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            rec.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority}
                          </Badge>
                          <span className="text-xs text-gray-600">{rec.impact}</span>
                        </div>
                        <p className="text-sm font-medium">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
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

          {/* Geographic Analysis Tab */}
          <TabsContent value="locations" className="space-y-6">
            {/* Santiago Comuna Analysis */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Análisis por Comuna - Región Metropolitana de Santiago
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Top 10 Comunas con Mayor Fraude</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(fraudStats.topComunas || []).map((comuna, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-red-600' :
                            index === 1 ? 'bg-orange-500' :
                            index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{comuna.comuna}</p>
                            <p className="text-xs text-gray-600">
                              {comuna.count} fraudes • Promedio: ${comuna.avgValue?.toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            ${(comuna.totalValue / 1000000)?.toFixed(1)}M
                          </p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              comuna.riskScore > 15 ? 'bg-red-500' :
                              comuna.riskScore > 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-xs">
                              Score: {comuna.riskScore?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Mapa de Calor - Riesgo por Comuna</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={fraudStats.topComunas?.slice(0, 8) || []} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="comuna" type="category" width={100} />
                      <Tooltip formatter={(value, name) => [
                        name === 'count' ? `${value} fraudes` : 
                        name === 'riskScore' ? `Score: ${value}` :
                        `$${value?.toLocaleString('es-CL')} CLP`,
                        name === 'count' ? 'Fraudes Detectados' : 
                        name === 'riskScore' ? 'Índice de Riesgo' : 'Valor Total'
                      ]} />
                      <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-medium text-red-800 mb-2">Zonas de Alto Riesgo Identificadas</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Las Condes:</span>
                        <p className="text-red-700">Centro financiero, productos premium</p>
                      </div>
                      <div>
                        <span className="font-medium">Providencia:</span>
                        <p className="text-red-700">Alto tráfico, centros comerciales</p>
                      </div>
                      <div>
                        <span className="font-medium">Santiago Centro:</span>
                        <p className="text-red-700">Diversidad demográfica, electrónicos</p>
                      </div>
                      <div>
                        <span className="font-medium">Vitacura:</span>
                        <p className="text-red-700">Ingresos altos, productos de lujo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Store Performance Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Rendimiento de Locales con Predicciones
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Local</th>
                        <th className="text-center p-2">Fraudes Actuales</th>
                        <th className="text-center p-2">Predicción 7 días</th>
                        <th className="text-center p-2">Valor Total</th>
                        <th className="text-center p-2">Nivel de Riesgo</th>
                        <th className="text-center p-2">Dispositivos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(fraudStats.topStores || []).slice(0, 12).map((store, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium text-xs">{store.name?.split(' - ')[0]}</p>
                              <p className="text-xs text-gray-600">{store.name?.split(' - ')[1]}</p>
                            </div>
                          </td>
                          <td className="p-2 text-center font-bold">{store.count}</td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className={store.predictedNext7Days > store.count ? 'text-red-600' : 'text-green-600'}>
                                {store.predictedNext7Days}
                              </span>
                              {store.predictedNext7Days > store.count && (
                                <TrendingUp className="w-3 h-3 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-center font-medium text-orange-600">
                            ${(store.totalValue / 1000)?.toFixed(0)}k
                          </td>
                          <td className="p-2 text-center">
                            <Badge className={`${
                              store.riskLevel === 'Alto' ? 'bg-red-100 text-red-700' :
                              store.riskLevel === 'Medio' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {store.riskLevel}
                            </Badge>
                          </td>
                          <td className="p-2 text-center">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {store.deviceTypes} tipos
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Insights Geográficos</h3>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-medium text-red-800">Zona Crítica</h4>
                    <p className="text-sm text-red-700 mb-2">Las Condes - Providencia</p>
                    <ul className="text-xs text-red-600 space-y-1">
                      <li>• 34% del total de fraudes</li>
                      <li>• $28M CLP en riesgo</li>
                      <li>• Recomendación: Refuerzo IA</li>
                    </ul>
                  </div>

                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                    <h4 className="font-medium text-yellow-800">Zona de Atención</h4>
                    <p className="text-sm text-yellow-700 mb-2">Santiago Centro - Ñuñoa</p>
                    <ul className="text-xs text-yellow-600 space-y-1">
                      <li>• 22% del total de fraudes</li>
                      <li>• Patrón: Productos electrónicos</li>
                      <li>• Monitoreo intensificado</li>
                    </ul>
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-medium text-green-800">Zona Controlada</h4>
                    <p className="text-sm text-green-700 mb-2">Resto RM</p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• <15% incidencia individual</li>
                      <li>• Sistemas IA efectivos</li>
                      <li>• Mantener protocolo actual</li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Correlación:</strong> Comunas de ingresos altos concentran 67% del valor total de fraudes, 
                      pero solo 43% de la frecuencia.
                    </p>
                  </div>
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