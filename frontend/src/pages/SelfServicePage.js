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
import { CheckCircle, Upload, Image, Settings, Send, Loader2, Eye, Clock, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SelfServicePage = ({ onLogout }) => {
  const [stores, setStores] = useState([]);
  const [flowSteps, setFlowSteps] = useState([
    {
      id: 1,
      title: "Paso 1 - Bienvenido",
      description: "Imagen de bienvenida con colores corporativos",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      selectedDemo: "bienvenido"
    },
    {
      id: 2,
      title: "Paso 2 - Pese su producto",
      description: "Foto de balanza con producto",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      selectedDemo: "pesar"
    },
    {
      id: 3,
      title: "Paso 3 - Retire la etiqueta",
      description: "Foto de mano tomando etiqueta",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      selectedDemo: "retirar"
    },
    {
      id: 4,
      title: "Paso 4 - Pegue la etiqueta",
      description: "Imagen amistosa de finalización",
      currentImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
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
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ],
    pesar: [
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ],
    retirar: [
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ],
    finalizar: [
      { name: "Frutas y Verduras Organizadas", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { name: "Verduras Frescas Variadas", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      { name: "Mercado de Productos Frescos", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" }
    ]
  };

  useEffect(() => {
    loadStores();
  }, []);

  // Update deployment duration timer
  useEffect(() => {
    let interval;
    if (isDeploying && deploymentStartTime) {
      interval = setInterval(() => {
        setDeploymentDuration(Math.floor((Date.now() - deploymentStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDeploying, deploymentStartTime]);

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
    setDeploymentStartTime(Date.now());
    setDeploymentDuration(0);
    setDeploymentErrors([]);
    
    // Calculate package size (simulate based on number of images)
    const calculatedSize = flowSteps.length * 2.8; // ~2.8MB per high-quality image
    setPackageSize(calculatedSize);

    const targetCount = getTargetStoresCount();
    
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        // Update duration
        setDeploymentDuration(Math.floor((Date.now() - deploymentStartTime) / 1000));
        
        if (prev >= targetCount) {
          clearInterval(interval);
          setIsDeploying(false);
          
          // Simulate some random errors (5% chance per store)
          const errors = [];
          for (let i = 0; i < targetCount; i++) {
            if (Math.random() < 0.05) {
              errors.push(`Local ${i + 1}: Error de conectividad`);
            }
          }
          setDeploymentErrors(errors);
          
          if (errors.length === 0) {
            toast.success(`Flujo desplegado satisfactoriamente en ${targetCount} locales`);
          } else {
            toast.warning(`Desplegado en ${targetCount - errors.length}/${targetCount} locales. ${errors.length} errores.`);
          }
          return targetCount;
        }
        return prev + 1;
      });
    }, 300);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Panel */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Destino de envío</Label>
                <Select value={deploymentTarget} onValueChange={setDeploymentTarget}>
                  <SelectTrigger className="w-full">
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
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                      style={{ width: `${(deploymentProgress / getTargetStoresCount()) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={deployFlow}
                  disabled={!validateConfiguration()}
                  className="w-full"
                  style={{ backgroundColor: '#0071CE' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Paquetizar y enviar
                </Button>
              )}
            </div>

            {/* Status Panel */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Estado del Despliegue
              </h4>
              
              <div className="space-y-3">
                {/* Locales Entregados */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                    }`}>
                      {deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium">Locales entregados</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: '#0071CE' }}>
                    {deploymentProgress}/{getTargetStoresCount()}
                  </span>
                </div>

                {/* Tiempo Total */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">Duración</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {isDeploying ? formatDuration(deploymentDuration) : '00:00'}
                  </span>
                </div>

                {/* Tamaño del Paquete */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Image className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Tamaño</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {packageSize > 0 ? `${packageSize.toFixed(1)} MB` : '- MB'}
                  </span>
                </div>

                {/* Observaciones */}
                {(isDeploying || deploymentErrors.length > 0 || (deploymentProgress === getTargetStoresCount() && deploymentProgress > 0)) && (
                  <div className="p-3 rounded-lg border-l-4" 
                       style={{ 
                         borderColor: deploymentErrors.length > 0 ? '#ef4444' : '#10b981',
                         backgroundColor: deploymentErrors.length > 0 ? '#fef2f2' : '#f0fdf4'
                       }}>
                    <div className="flex items-start gap-2">
                      {deploymentErrors.length > 0 ? (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">
                          {deploymentErrors.length > 0 ? 'Observaciones' : 'Estado'}
                        </h5>
                        {deploymentErrors.length > 0 ? (
                          <div className="text-xs text-red-700 space-y-1">
                            {deploymentErrors.slice(0, 3).map((error, idx) => (
                              <div key={idx}>• {error}</div>
                            ))}
                            {deploymentErrors.length > 3 && (
                              <div className="text-red-600">+ {deploymentErrors.length - 3} errores más</div>
                            )}
                          </div>
                        ) : deploymentProgress === getTargetStoresCount() && deploymentProgress > 0 ? (
                          <div className="text-xs text-green-700">
                            ✅ Flujo desplegado satisfactoriamente en todos los locales
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">
                            {isDeploying ? 'Enviando configuraciones...' : 'Listo para desplegar'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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