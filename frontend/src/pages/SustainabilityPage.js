import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Leaf, TrendingDown, TrendingUp, Zap, FileText, Target, Award, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SustainabilityPage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [sustainabilityData, setSustainabilityData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSustainabilityData();
  }, []);

  const loadSustainabilityData = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
      
      // Calculate sustainability metrics for each store based on real data
      // Energy: 35W per scale × 24h × 30 days = 25.2 kWh/month per scale
      // Paper: 3.5 rolls/day × 50m/roll × 30 days = 5,250m/month per autoservice scale
      // CO2: 0.5 kg CO2e per kWh for energy + 0.006 kg CO2e per meter of paper
      const MONTHLY_ENERGY_PER_SCALE = 25.2; // kWh per month
      const MONTHLY_PAPER_PER_AUTOSERVICE_SCALE = 5250; // meters per month
      const CO2_PER_KWH = 0.5; // kg CO2e per kWh
      const CO2_PER_METER_PAPER = 0.006; // kg CO2e per meter of thermal paper

      const sustainability = {};
      response.data.forEach(store => {
        const devices = store.devices || [];
        const autoserviceBalances = store.balances_autoservicio || 0;
        
        // Energy consumption based on actual device count (kWh per month)
        const energyConsumption = devices.length * MONTHLY_ENERGY_PER_SCALE;
        
        // Paper consumption for autoservice balances (meters per month)
        const paperConsumption = autoserviceBalances * MONTHLY_PAPER_PER_AUTOSERVICE_SCALE;
        
        // CO2 emissions calculation (kg CO2e per month)
        const energyCO2 = energyConsumption * CO2_PER_KWH;
        const paperCO2 = paperConsumption * CO2_PER_METER_PAPER;
        const carbonFootprint = energyCO2 + paperCO2;
        
        // Sustainability score (0-100, where 100 is best)
        // Based on CO2 per device - lower is better
        const co2PerDevice = devices.length > 0 ? carbonFootprint / devices.length : 0;
        const score = Math.max(0, 100 - (co2PerDevice * 3)); // Adjusted scale
        
        sustainability[store.id] = {
          energyConsumption,
          paperConsumption,
          carbonFootprint,
          energyCO2,
          paperCO2,
          score,
          category: score >= 70 ? 'green' : score >= 40 ? 'orange' : 'red',
          recommendations: generateRecommendations(score, energyConsumption, paperConsumption, autoserviceBalances)
        };
      });
      
      setSustainabilityData(sustainability);
    } catch (error) {
      console.error('Error loading sustainability data:', error);
      toast.error('Error al cargar datos de sostenibilidad');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (score, energy, paper, autoserviceBalances) => {
    const recommendations = [];
    
    // Paper consumption recommendations based on autoservice balances
    if (autoserviceBalances > 3) {
      recommendations.push({
        type: 'paper',
        title: 'Adopta papel linerless',
        description: 'Reduce hasta 40% el consumo de papel térmico en balanzas autoservicio',
        impact: 'Alto',
        savings: '40%',
        co2Reduction: '2.1 kg CO2e/mes'
      });
    }
    
    // Energy efficiency recommendations 
    if (energy > 100) {
      recommendations.push({
        type: 'energy',
        title: 'Optimiza horarios operativos',
        description: 'Programa apagado automático en horarios no operativos',
        impact: 'Medio',
        savings: '25%',
        co2Reduction: '3.15 kg CO2e/mes'
      });
    }
    
    if (score < 60) {
      recommendations.push({
        type: 'calibration',
        title: 'Calibraciones programadas',
        description: 'Mejora eficiencia energética con calibraciones regulares',
        impact: 'Medio',
        savings: '15%',
        co2Reduction: '1.89 kg CO2e/mes'
      });
    }
    
    if (score < 40) {
      recommendations.push({
        type: 'upgrade',
        title: 'Actualizar firmware',
        description: 'Versiones más eficientes reducen consumo energético',
        impact: 'Alto',
        savings: '30%',
        co2Reduction: '3.78 kg CO2e/mes'
      });
    }

    return recommendations;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'green': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'orange': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
      case 'red': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getOverallMetrics = () => {
    const totalEnergy = Object.values(sustainabilityData).reduce((sum, data) => sum + data.energyConsumption, 0);
    const totalPaper = Object.values(sustainabilityData).reduce((sum, data) => sum + data.paperConsumption, 0);
    const totalCarbon = Object.values(sustainabilityData).reduce((sum, data) => sum + data.carbonFootprint, 0);
    const avgScore = Object.values(sustainabilityData).reduce((sum, data) => sum + data.score, 0) / Object.keys(sustainabilityData).length;
    
    const greenStores = Object.values(sustainabilityData).filter(data => data.category === 'green').length;
    const orangeStores = Object.values(sustainabilityData).filter(data => data.category === 'orange').length;
    const redStores = Object.values(sustainabilityData).filter(data => data.category === 'red').length;

    return {
      totalEnergy: totalEnergy.toFixed(1),
      totalPaper: totalPaper.toLocaleString(),
      totalCarbon: totalCarbon.toFixed(1),
      avgScore: avgScore.toFixed(1),
      greenStores,
      orangeStores,
      redStores
    };
  };

  const metrics = Object.keys(sustainabilityData).length > 0 ? getOverallMetrics() : {};

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
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              Indicadores de Sostenibilidad
            </h1>
            <p className="text-gray-600 mt-1">Monitoreo de huella de carbono y eficiencia ambiental</p>
          </div>
          <Badge className="bg-green-100 text-green-800 px-4 py-2">
            Sistema Verde Activo
          </Badge>
        </div>

        {/* Overall Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Huella de Carbono Total</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCarbon} kg CO₂</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -12% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consumo Energético</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalEnergy} kWh</p>
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consumo de Papel</p>
                <p className="text-2xl font-bold text-gray-900">{(metrics.totalPaper / 1000).toFixed(1)} km</p>
                <p className="text-xs text-gray-600">metros/mes</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgScore}/100</p>
                <div className="flex gap-1 mt-1">
                  <Badge className="bg-green-100 text-green-700 text-xs">{metrics.greenStores} Verde</Badge>
                  <Badge className="bg-orange-100 text-orange-700 text-xs">{metrics.orangeStores} Medio</Badge>
                  <Badge className="bg-red-100 text-red-700 text-xs">{metrics.redStores} Alto</Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Top 5 Locales Más Sostenibles
            </h3>
            <div className="space-y-3">
              {stores
                .sort((a, b) => (sustainabilityData[b.id]?.score || 0) - (sustainabilityData[a.id]?.score || 0))
                .slice(0, 5)
                .map((store, index) => {
                  const data = sustainabilityData[store.id];
                  const colors = getCategoryColor(data?.category);
                  return (
                    <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.comuna}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{data?.score.toFixed(1)}/100</p>
                        <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                          {data?.carbonFootprint.toFixed(1)} kg CO₂
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Locales que Requieren Atención
            </h3>
            <div className="space-y-3">
              {stores
                .filter(store => sustainabilityData[store.id]?.category === 'red')
                .slice(0, 5)
                .map((store) => {
                  const data = sustainabilityData[store.id];
                  return (
                    <div key={store.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.comuna}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{data?.score.toFixed(1)}/100</p>
                        <p className="text-xs text-red-600">{data?.carbonFootprint.toFixed(1)} kg CO₂</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* Detailed Store Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Análisis Detallado por Local</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Local</th>
                  <th className="text-left p-3">Puntuación</th>
                  <th className="text-left p-3">CO₂ (kg/mes)</th>
                  <th className="text-left p-3">Energía (kWh/mes)</th>
                  <th className="text-left p-3">Papel (km/mes)</th>
                  <th className="text-left p-3">Recomendaciones</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => {
                  const data = sustainabilityData[store.id];
                  const colors = getCategoryColor(data?.category);
                  return (
                    <tr key={store.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-xs text-gray-600">{store.comuna}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={data?.score} className="w-20" />
                          <span className="text-sm font-medium">{data?.score.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`${colors.bg} ${colors.text}`}>
                          {data?.carbonFootprint.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="p-3">{data?.energyConsumption.toFixed(1)}</td>
                      <td className="p-3">{(data?.paperConsumption / 1000).toFixed(2)}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {data?.recommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {rec.title}
                              </span>
                              <span className="text-xs text-green-600">-{rec.savings}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SustainabilityPage;