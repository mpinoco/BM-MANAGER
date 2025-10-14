import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  MessageCircle, AlertTriangle, Phone, User, Shield, Plus, Trash2, TrendingUp, 
  CheckCircle, Target, Wrench, Settings, MessageSquare, Brain, DollarSign, 
  MapPin, Activity, Eye, RefreshCw, Calendar, Download, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const AIServicesPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30'); // days

  // AI Services Data
  const [aiMetrics, setAiMetrics] = useState({
    totalSavings: 162000000, // CLP per year
    fraudsDetected: 1847,
    fraudsPrevented: 1592,
    preventionRate: 86.2,
    roiAnnual: 285,
    gravitPrecision: 98.3,
    edgifyPrecision: 97.1,
    monthlyCost: 85000000,
    monthlyFrauds: 154
  });

  // High-value fraud products with real imagery
  const fraudProducts = [
    {
      name: 'Queso Quilque Soprole',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop',
      attempts: 89,
      avgValue: 5500,
      totalLoss: 489500,
      riskLevel: 'Crítico'
    },
    {
      name: 'Whisky Premium Johnnie Walker',
      image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&fit=crop',
      attempts: 67,
      avgValue: 89000,
      totalLoss: 5963000,
      riskLevel: 'Alto'
    },
    {
      name: 'Bolsa con Pan Artesanal',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      attempts: 45,
      avgValue: 3500,
      totalLoss: 157500,
      riskLevel: 'Alto'
    },
    {
      name: 'Lata de Café Premium',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      attempts: 34,
      avgValue: 8500,
      totalLoss: 289000,
      riskLevel: 'Medio'
    }
  ];

  // High-risk products detected by AI
  const highRiskProducts = [
    {
      name: 'Taladro Eléctrico',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
      attempts: 52,
      avgValue: 85000,
      totalLoss: 4420000,
      riskLevel: 'Alto'
    },
    {
      name: 'Set de Atornilladores',
      image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=300&fit=crop',
      attempts: 38,
      avgValue: 35000,
      totalLoss: 1330000,
      riskLevel: 'Medio'
    },
    {
      name: 'Lomo de Vacuno al Vacío',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&h=300&fit=crop',
      attempts: 71,
      avgValue: 12000,
      totalLoss: 852000,
      riskLevel: 'Crítico'
    },
    {
      name: 'Tablet Samsung',
      image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=300&fit=crop',
      attempts: 44,
      avgValue: 350000,
      totalLoss: 15400000,
      riskLevel: 'Alto'
    }
  ];

  // Santiago communes fraud analysis
  const comunaFraudData = [
    { comuna: 'Las Condes', frauds: 156, value: 89500000, riskScore: 18.7, percentage: 34 },
    { comuna: 'Providencia', frauds: 98, value: 45200000, riskScore: 12.1, percentage: 22 },
    { comuna: 'Santiago Centro', frauds: 76, value: 28900000, riskScore: 9.8, percentage: 17 },
    { comuna: 'Vitacura', frauds: 54, value: 67300000, riskScore: 14.2, percentage: 12 },
    { comuna: 'Ñuñoa', frauds: 43, value: 18700000, riskScore: 7.3, percentage: 9 },
    { comuna: 'Recoleta', frauds: 28, value: 12400000, riskScore: 4.9, percentage: 6 }
  ];

  // Predictive indicators for stores
  const storeRiskPredictions = [
    { 
      store: 'Local Las Condes Plaza', 
      currentFrauds: 23, 
      predictedNext7Days: 28, 
      riskTrend: '+21%', 
      recommendation: 'Reforzar supervisión IA',
      comuna: 'Las Condes'
    },
    { 
      store: 'Local Costanera Center', 
      currentFrauds: 19, 
      predictedNext7Days: 24, 
      riskTrend: '+26%', 
      recommendation: 'Aumentar alertas SCO',
      comuna: 'Providencia'
    },
    { 
      store: 'Local Plaza de Armas', 
      currentFrauds: 15, 
      predictedNext7Days: 18, 
      riskTrend: '+20%', 
      recommendation: 'Capacitar operadores',
      comuna: 'Santiago Centro'
    }
  ];

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'Jul', gravitSavings: 12.5, edgifySavings: 9.8, totalFrauds: 142 },
    { month: 'Ago', gravitSavings: 14.2, edgifySavings: 11.3, totalFrauds: 156 },
    { month: 'Sep', gravitSavings: 16.8, edgifySavings: 13.7, totalFrauds: 167 },
    { month: 'Oct', gravitSavings: 18.9, edgifySavings: 15.2, totalFrauds: 154 }
  ];

  const COLORS = ['#0071CE', '#FFC220', '#1B4D89', '#FF6B6B', '#4ECDC4'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              Servicios IA - Allcom Technologies
            </h1>
            <p className="text-gray-600 mt-1">Gestión y monitoreo de servicios de inteligencia artificial</p>
            
            {/* Executive Summary */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-800">
                <strong className="text-green-700">💰 Impacto Financiero:</strong> Los servicios de IA han generado un ahorro de{' '}
                <span className="font-bold text-blue-600">${(aiMetrics.totalSavings / 1000000).toFixed(0)}M CLP anuales</span>, 
                con una tasa de prevención del{' '}
                <span className="font-bold text-green-600">{aiMetrics.preventionRate}%</span>{' '}
                y un ROI del <span className="font-bold text-purple-600">{aiMetrics.roiAnnual}%</span>.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="px-4 py-2 bg-green-100 text-green-800">
              Gravit: Activo ({aiMetrics.gravitPrecision}%)
            </Badge>
            <Badge className="px-4 py-2 bg-blue-100 text-blue-800">
              Edgify: Activo ({aiMetrics.edgifyPrecision}%)
            </Badge>
            <Button onClick={() => window.location.href = '/ai-connectors'} className="bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              Panel Avanzado
            </Button>
          </div>
        </div>

        {/* Main KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Ahorro Total Anual</p>
                <p className="text-2xl font-bold text-green-700">
                  ${(aiMetrics.totalSavings / 1000000).toFixed(0)}M CLP
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +28% vs año anterior
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Fraudes Detectados</p>
                <p className="text-2xl font-bold text-red-700">{aiMetrics.fraudsDetected}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3" />
                  {aiMetrics.preventionRate}% prevenidos
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">ROI Anual</p>
                <p className="text-2xl font-bold text-blue-700">{aiMetrics.roiAnnual}%</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3" />
                  Gravit + Edgify
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
                <p className="text-sm font-medium text-gray-700">Precisión IA</p>
                <p className="text-2xl font-bold text-purple-700">97.7%</p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3" />
                  Promedio combinado
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Professional Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen Ejecutivo</TabsTrigger>
            <TabsTrigger value="products">Productos Fraude</TabsTrigger>
            <TabsTrigger value="geographic">Análisis Geográfico</TabsTrigger>
            <TabsTrigger value="predictions">Predicciones</TabsTrigger>
            <TabsTrigger value="whatsapp">Soporte WhatsApp</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Financial Impact Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Ahorro Mensual por Proveedor IA
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}M CLP`, '']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="gravitSavings" 
                      stroke="#0071CE" 
                      strokeWidth={3}
                      name="Gravit AI"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="edgifySavings" 
                      stroke="#9333EA" 
                      strokeWidth={3}
                      name="Edgify Analytics"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Tendencia:</strong> Crecimiento del 34% en ahorro acumulado durante los últimos 4 meses.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Detección de Fraudes vs Ahorro
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="totalFrauds" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.3}
                      name="Fraudes Detectados"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">Fraudes Oct</p>
                    <p className="text-2xl font-bold text-red-800">{aiMetrics.monthlyFrauds}</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">Ahorro Oct</p>
                    <p className="text-2xl font-bold text-green-800">$34.1M</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* ROI Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Análisis de Retorno de Inversión (ROI)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-800 mb-2">Gravit AI</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Costo mensual:</span>
                        <span className="font-medium">$45M CLP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ahorro generado:</span>
                        <span className="font-medium text-green-600">$67M CLP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI individual:</span>
                        <span className="font-bold text-blue-600">312%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <h4 className="font-medium text-purple-800 mb-2">Edgify Analytics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Costo mensual:</span>
                        <span className="font-medium">$40M CLP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ahorro generado:</span>
                        <span className="font-medium text-green-600">$58M CLP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI individual:</span>
                        <span className="font-bold text-purple-600">258%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Impacto Consolidado</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Ahorro Neto', value: 125, color: '#10B981' },
                          { name: 'Costo IA', value: 85, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value}M`}
                      >
                        {[
                          { name: 'Ahorro Neto', value: 125, color: '#10B981' },
                          { name: 'Costo IA', value: 85, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Proyección Anual</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">Ahorro proyectado 2025</p>
                      <p className="text-2xl font-bold text-green-800">$1.5B CLP</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">Costo total anual</p>
                      <p className="text-2xl font-bold text-gray-800">$1.02B CLP</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">Beneficio neto</p>
                      <p className="text-2xl font-bold text-blue-800">$480M CLP</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Products Fraud Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Productos Más Utilizados para Fraude (Con Imágenes)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {fraudProducts.map((product, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm" style={{ display: 'none' }}>
                        Imagen del producto
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Intentos fraude:</span>
                          <span className="font-bold text-red-600">{product.attempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor promedio:</span>
                          <span className="font-bold text-green-600">
                            ${product.avgValue.toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pérdida potencial:</span>
                          <span className="font-bold text-orange-600">
                            ${product.totalLoss.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge className={`w-full text-center justify-center ${
                          product.riskLevel === 'Crítico' ? 'bg-red-100 text-red-800' :
                          product.riskLevel === 'Alto' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          Riesgo {product.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">🔍 Análisis de Patrones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Productos electrónicos:</strong> 67% mayor probabilidad de fraude</p>
                    <p><strong>Horario crítico:</strong> 18:00-20:00 hrs (peak de intentos)</p>
                  </div>
                  <div>
                    <p><strong>Valor promedio fraude:</strong> $456,000 CLP</p>
                    <p><strong>Tasa detección:</strong> 97.7% con IA dual</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Geographic Analysis Tab */}
          <TabsContent value="geographic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Comunas de Santiago con Mayor Fraude
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={comunaFraudData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="comuna" type="category" width={100} />
                    <Tooltip formatter={(value, name) => [
                      name === 'frauds' ? `${value} fraudes` : `$${(value / 1000000).toFixed(1)}M CLP`,
                      name === 'frauds' ? 'Fraudes Detectados' : 'Valor Total'
                    ]} />
                    <Bar dataKey="frauds" fill="#EF4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Zona crítica:</strong> Las Condes y Providencia concentran el 56% del total de fraudes detectados.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Análisis de Riesgo por Comuna</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {comunaFraudData.map((comuna, index) => (
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
                            {comuna.frauds} fraudes • {comuna.percentage}% del total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          ${(comuna.value / 1000000).toFixed(1)}M
                        </p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            comuna.riskScore > 15 ? 'bg-red-500' :
                            comuna.riskScore > 10 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-xs">
                            Score: {comuna.riskScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Indicadores Predictivos de Locales con Mayor Riesgo
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Local</th>
                      <th className="text-center p-3">Fraudes Actuales</th>
                      <th className="text-center p-3">Predicción 7 días</th>
                      <th className="text-center p-3">Tendencia</th>
                      <th className="text-left p-3">Recomendación IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeRiskPredictions.map((store, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{store.store}</p>
                            <p className="text-xs text-gray-600">{store.comuna}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold">{store.currentFrauds}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-red-600 font-bold">{store.predictedNext7Days}</span>
                            <TrendingUp className="w-3 h-3 text-red-600" />
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className="bg-red-100 text-red-800">
                            {store.riskTrend}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{store.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">🤖 Recomendaciones Automáticas IA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <ul className="space-y-1">
                    <li>• Intensificar supervisión en horario 18:00-20:00</li>
                    <li>• Implementar alertas automáticas para productos &gt;$500K</li>
                    <li>• Capacitar personal en locales de alto riesgo</li>
                  </ul>
                  <ul className="space-y-1">
                    <li>• Activar modo alta sensibilidad en SCO</li>
                    <li>• Revisar calibración de balanzas mensualmente</li>
                    <li>• Análisis predictivo cada 48 horas</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* WhatsApp Support Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Productos de Alto Riesgo Detectados por IA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fraudProducts.map((product, index) => (
                  <Card key={index} className="p-4 border-2" style={{ 
                    borderColor: product.riskLevel === 'Crítico' ? '#EF4444' : 
                                product.riskLevel === 'Alto' ? '#F59E0B' : '#10B981' 
                  }}>
                    <div className="relative mb-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                        }}
                      />
                      <Badge 
                        className="absolute top-2 right-2"
                        style={{
                          backgroundColor: product.riskLevel === 'Crítico' ? '#EF4444' : 
                                          product.riskLevel === 'Alto' ? '#F59E0B' : '#10B981',
                          color: 'white'
                        }}
                      >
                        {product.riskLevel}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">{product.name}</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Intentos:</span>
                          <span className="font-medium text-red-600">{product.attempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor promedio:</span>
                          <span className="font-medium">${(product.avgValue / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pérdida total:</span>
                          <span className="font-bold text-red-700">${(product.totalLoss / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Fraud Patterns Analysis */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Análisis de Patrones de Fraude
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fraudProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Intentos de fraude']} />
                  <Bar dataKey="attempts" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Geographic Analysis Tab */}
          <TabsContent value="geographic" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Análisis de Fraude por Comuna - Santiago
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={comunaFraudData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="comuna" type="category" width={100} fontSize={12} />
                      <Tooltip formatter={(value) => [`${value}`, 'Fraudes detectados']} />
                      <Bar dataKey="frauds" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {comunaFraudData.map((comuna, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-800">{comuna.comuna}</h4>
                        <Badge 
                          style={{
                            backgroundColor: comuna.riskScore > 15 ? '#EF4444' : 
                                           comuna.riskScore > 10 ? '#F59E0B' : '#10B981',
                            color: 'white'
                          }}
                        >
                          Riesgo: {comuna.riskScore}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Fraudes:</span>
                          <span className="font-bold text-red-600 ml-1">{comuna.frauds}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-bold ml-1">${(comuna.value / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Participación</span>
                          <span>{comuna.percentage}%</span>
                        </div>
                        <Progress value={comuna.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Predicciones de Riesgo por Local
              </h3>
              <div className="space-y-4">
                {storeRiskPredictions.map((store, index) => (
                  <div key={index} className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{store.store}</h4>
                        <p className="text-sm text-gray-600">{store.comuna}</p>
                      </div>
                      <Badge 
                        style={{
                          backgroundColor: store.riskTrend.includes('+') ? '#EF4444' : '#10B981',
                          color: 'white'
                        }}
                      >
                        {store.riskTrend}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Fraudes Actuales</p>
                        <p className="text-xl font-bold text-red-600">{store.currentFrauds}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Predicción 7 días</p>
                        <p className="text-xl font-bold text-orange-600">{store.predictedNext7Days}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tendencia</p>
                        <p className="text-lg font-bold text-purple-600">{store.riskTrend}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded border border-purple-200">
                      <p className="text-sm font-medium text-purple-800">
                        <span className="text-purple-600">💡 Recomendación:</span> {store.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Predictive Model Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Rendimiento del Modelo Predictivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <h4 className="font-semibold text-blue-800 mb-2">Precisión</h4>
                  <p className="text-3xl font-bold text-blue-600">94.7%</p>
                  <p className="text-sm text-blue-700">Predicciones correctas</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <h4 className="font-semibold text-green-800 mb-2">Recall</h4>
                  <p className="text-3xl font-bold text-green-600">91.3%</p>
                  <p className="text-sm text-green-700">Fraudes detectados</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                  <h4 className="font-semibold text-purple-800 mb-2">F1-Score</h4>
                  <p className="text-3xl font-bold text-purple-600">92.9%</p>
                  <p className="text-sm text-purple-700">Rendimiento general</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* WhatsApp Support Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                WhatsApp - Soporte Técnico IA 24/7
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">🤖 Asistente IA Integrado</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Sistema de soporte inteligente que responde automáticamente consultas técnicas sobre balanzas y detecta problemas en tiempo real.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Precisión respuestas:</span>
                        <span className="font-bold">94.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiempo respuesta promedio:</span>
                        <span className="font-bold">&lt;2 minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolución automática:</span>
                        <span className="font-bold">78%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">📱 Funciones Disponibles</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Diagnóstico automático de balanzas</li>
                      <li>• Generación de tickets de soporte</li>
                      <li>• Alertas proactivas de mantenimiento</li>
                      <li>• Guías de resolución paso a paso</li>
                      <li>• Escalamiento automático a técnicos</li>
                      <li>• Reportes de incidencias en PDF</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">📊 Estadísticas de Soporte</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">342</p>
                        <p className="text-xs text-gray-600">Consultas resueltas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">28</p>
                        <p className="text-xs text-gray-600">Tickets generados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">4.8/5</p>
                        <p className="text-xs text-gray-600">Satisfacción promedio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">1.7min</p>
                        <p className="text-xs text-gray-600">Tiempo respuesta</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-white font-medium" 
                    style={{ backgroundColor: '#25D366' }}
                    onClick={() => toast.success('Redirigiendo a WhatsApp Business...')}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Abrir WhatsApp Business
                  </Button>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Consejo:</strong> Para activar notificaciones automáticas de fraudes por WhatsApp, 
                      configure los umbrales en el Panel Avanzado de Conectores IA.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">📝 Actividad Reciente</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {[
                    { time: '10:34', message: 'Ticket #2847 generado: Local Las Condes - Balanza desconectada', status: 'success' },
                    { time: '09:15', message: 'Alerta automática enviada: 15 fraudes detectados en 1 hora', status: 'warning' },
                    { time: '08:42', message: 'Consulta resuelta: Calibración balanza BMS-445', status: 'info' },
                    { time: '07:58', message: 'Mantenimiento preventivo programado: Local Providencia', status: 'success' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border-l-4 border-gray-200 bg-gray-50 rounded-r">
                      <span className="text-xs text-gray-600 w-12">{activity.time}</span>
                      <span className="text-sm flex-1">{activity.message}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AIServicesPage;