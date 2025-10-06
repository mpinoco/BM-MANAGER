import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, Image, Settings, Send, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const SelfServicePage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [flowSteps, setFlowSteps] = useState([
    {
      id: 1,
      title: "Paso 1 - Bienvenido",
      description: "Imagen de bienvenida con colores corporativos",
      currentImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      selectedDemo: "bienvenido"
    },
    {
      id: 2,
      title: "Paso 2 - Pese su producto",
      description: "Foto de balanza con producto",
      currentImage: "https://images.unsplash.com/photo-1556909114-4f6e7be7b0fd?w=400&h=300&fit=crop",
      selectedDemo: "pesar"
    },
    {
      id: 3,
      title: "Paso 3 - Retire la etiqueta",
      description: "Foto de mano tomando etiqueta",
      currentImage: "https://images.unsplash.com/photo-1609603111802-a0d33ab4b9cf?w=400&h=300&fit=crop",
      selectedDemo: "retirar"
    },
    {
      id: 4,
      title: "Paso 4 - Pegue la etiqueta",
      description: "Imagen amistosa de finalización",
      currentImage: "https://images.unsplash.com/photo-1595475038665-62795d58f1e5?w=400&h=300&fit=crop",
      selectedDemo: "finalizar"
    }
  ]);
  
  const [deploymentTarget, setDeploymentTarget] = useState('autoservicio');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(1);
  const [deploymentStartTime, setDeploymentStartTime] = useState(null);
  const [deploymentDuration, setDeploymentDuration] = useState(0);
  const [packageSize, setPackageSize] = useState(0);
  const [deploymentErrors, setDeploymentErrors] = useState([]);

  const demoImages = {
    bienvenido: [
      { name: "Frutas Frescas Bienvenida", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado Fresco", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ],
    pesar: [
      { name: "Manzanas en Autoservicio", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop" },
      { name: "Tomates Frescos", url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop" },
      { name: "Pimientos Variados", url: "https://images.unsplash.com/photo-1563565375-f3c8de43e1de?w=400&h=300&fit=crop" }
    ],
    retirar: [
      { name: "Bananas Frescas", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" },
      { name: "Naranjas Organizadas", url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop" },
      { name: "Limones Frescos", url: "https://images.unsplash.com/photo-1590005354167-6da97870c757?w=400&h=300&fit=crop" }
    ],
    finalizar: [
      { name: "Verduras Verdes", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop" },
      { name: "Apio y Verduras", url: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop" },
      { name: "Brócoli y Coliflor", url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop" }
    ]
  };

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handleImageUpload = (stepId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateStepImage(stepId, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateStepImage = (stepId, imageUrl) => {
    setFlowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, currentImage: imageUrl } : step
    ));
  };

  const selectDemoImage = (stepId, demoType, imageUrl) => {
    setFlowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, currentImage: imageUrl, selectedDemo: demoType } : step
    ));
  };

  const getTargetStoresCount = () => {
    switch (deploymentTarget) {
      case 'current':
        return 1;
      case 'autoservicio':
        return stores.filter(store => store.balances_autoservicio > 0).length;
      case 'all':
        return stores.length;
      default:
        return 0;
    }
  };

  const deployFlow = async () => {
    const allStepsHaveImages = flowSteps.every(step => step.currentImage);
    if (!allStepsHaveImages) {
      toast.error('Todos los pasos deben tener una imagen seleccionada');
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);

    const targetCount = getTargetStoresCount();
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= targetCount) {
          clearInterval(interval);
          setIsDeploying(false);
          toast.success(`Flujo desplegado satisfactoriamente en ${targetCount} locales`);
          return targetCount;
        }
        return prev + 1;
      });
    }, 200);
  };

  const validateConfiguration = () => {
    return flowSteps.every(step => step.currentImage);
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Configuración de Flujos de Autoservicio
            </h1>
            <p className="text-gray-600 mt-1">Personaliza las imágenes de cada paso en las balanzas de autoservicio</p>
          </div>
          <Button 
            onClick={() => setShowPreview(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Vista Previa
          </Button>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {flowSteps.map((step) => (
            <Card key={step.id} className="p-6 shadow-lg">
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                  <Badge style={{ backgroundColor: '#0071CE', color: 'white' }}>
                    {step.id}/4
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">{step.description}</p>

                {/* Current Image Preview */}
                <div className="relative group">
                  <img 
                    src={step.currentImage} 
                    alt={`Paso ${step.id}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Imagen Actual</span>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="space-y-3">
                  <Label htmlFor={`upload-${step.id}`} className="text-sm font-medium">
                    Cargar nueva imagen
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`upload-${step.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(step.id, e)}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById(`upload-${step.id}`).click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Examinar foto
                    </Button>
                  </div>
                </div>

                {/* Demo Images Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Fotos demo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {demoImages[step.selectedDemo]?.map((demo, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img 
                          src={demo.url} 
                          alt={demo.name}
                          className="w-full h-16 object-cover rounded border hover:border-blue-500 transition-colors"
                          onClick={() => selectDemoImage(step.id, step.selectedDemo, demo.url)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <span className="text-white text-xs text-center px-1">{demo.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Complete Configuration */}
        <Card className="p-6 shadow-lg">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Completar Configuración</h3>
            {validateConfiguration() ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Todos los pasos tienen imágenes configuradas</span>
              </div>
            ) : (
              <div className="text-amber-600">
                ⚠️ Faltan imágenes en algunos pasos
              </div>
            )}
          </div>
        </Card>

        {/* Deployment Section */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Paquetizar y enviar a locales</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Destino de envío</Label>
              <Select value={deploymentTarget} onValueChange={setDeploymentTarget}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Enviar a este local (1 local)</SelectItem>
                  <SelectItem value="autoservicio">
                    Enviar sólo a locales con autoservicio ({stores.filter(s => s.balances_autoservicio > 0).length} locales)
                  </SelectItem>
                  <SelectItem value="all">Enviar a todos los locales ({stores.length} locales)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isDeploying ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Conectando con locales... {deploymentProgress}/{getTargetStoresCount()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(deploymentProgress / getTargetStoresCount()) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button
                onClick={deployFlow}
                disabled={!validateConfiguration()}
                className="w-full max-w-md"
                style={{ backgroundColor: '#0071CE' }}
              >
                <Send className="w-4 h-4 mr-2" />
                Paquetizar y enviar
              </Button>
            )}
          </div>
        </Card>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vista Previa del Flujo de Autoservicio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {flowSteps.map((step, index) => (
                  <Button
                    key={step.id}
                    size="sm"
                    variant={previewStep === step.id ? "default" : "outline"}
                    onClick={() => setPreviewStep(step.id)}
                  >
                    Paso {step.id}
                  </Button>
                ))}
              </div>
              
              {flowSteps.map((step) => (
                previewStep === step.id && (
                  <div key={step.id} className="text-center space-y-4">
                    <img 
                      src={step.currentImage} 
                      alt={step.title}
                      className="w-full h-64 object-cover rounded-lg mx-auto"
                    />
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                )
              ))}
              
              <div className="flex justify-between pt-4">
                <Button 
                  onClick={() => setPreviewStep(Math.max(1, previewStep - 1))}
                  disabled={previewStep === 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button 
                  onClick={() => setPreviewStep(Math.min(4, previewStep + 1))}
                  disabled={previewStep === 4}
                  style={{ backgroundColor: '#0071CE' }}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SelfServicePage;