import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Printer, Hand, CheckCircle, ArrowRight } from 'lucide-react';

const SelfServicePage = ({ onLogout }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: '¡Bienvenido!',
      subtitle: '¿Cómo estás?',
      icon: Hand,
      color: '#79b9e7',
      message: 'Iniciemos el proceso de pesaje autoservicio',
      action: 'Comenzar'
    },
    {
      title: 'Deposite su Producto',
      subtitle: 'Coloque el producto en la balanza',
      icon: Scale,
      color: '#10b981',
      message: 'Por favor, deposite cuidadosamente el producto sobre la plataforma de la balanza',
      action: 'Producto Depositado'
    },
    {
      title: 'Cálculo de Peso',
      subtitle: 'Procesando...',
      icon: Scale,
      color: '#f47421',
      message: 'Calculando peso y precio del producto',
      action: 'Continuar',
      autoAdvance: true
    },
    {
      title: 'Retire su Etiqueta',
      subtitle: 'Etiqueta lista',
      icon: Printer,
      color: '#f59e0b',
      message: 'Su etiqueta ha sido impresa. Por favor, retírela y péguela en el producto',
      action: 'Etiqueta Retirada'
    },
    {
      title: '¡Gracias!',
      subtitle: 'Proceso completado',
      icon: CheckCircle,
      color: '#10b981',
      message: 'Gracias por usar nuestro sistema de autoservicio',
      action: 'Nueva Operación'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
        
        // Auto-advance on processing step
        if (steps[currentStep + 1].autoAdvance) {
          setTimeout(() => {
            handleNext();
          }, 2000);
        }
      }, 300);
    } else {
      // Reset
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(0);
        setIsAnimating(false);
      }, 300);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Flujo de Autoservicio
          </h1>
          <p className="text-gray-600 mt-1">Simulación del proceso guiado para clientes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((s, idx) => (
              <div 
                key={idx}
                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                  idx <= currentStep ? 'opacity-100' : 'opacity-30'
                }`}
                style={{ backgroundColor: idx <= currentStep ? step.color : '#e5e7eb' }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Paso {currentStep + 1} de {steps.length}
          </p>
        </div>

        {/* Main Display Card */}
        <Card className={`flex-1 shadow-2xl overflow-hidden transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            {/* Icon */}
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-lg"
              style={{ backgroundColor: `${step.color}20` }}
            >
              <Icon size={64} style={{ color: step.color }} />
            </div>

            {/* Title */}
            <h2 
              className="text-5xl font-bold mb-4"
              style={{ color: step.color, fontFamily: 'Inter, sans-serif' }}
            >
              {step.title}
            </h2>

            {/* Subtitle */}
            <p className="text-2xl text-gray-600 mb-8">{step.subtitle}</p>

            {/* Message */}
            <p className="text-lg text-gray-700 max-w-2xl mb-12">
              {step.message}
            </p>

            {/* Weight Display (only on calculation step) */}
            {currentStep === 2 && (
              <div className="mb-8 p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Peso detectado:</p>
                <p className="text-4xl font-bold" style={{ color: '#f47421' }}>1.245 kg</p>
                <p className="text-sm text-gray-600 mt-4 mb-2">Precio:</p>
                <p className="text-3xl font-bold text-gray-800">$2.490</p>
              </div>
            )}

            {/* Action Button */}
            {!step.autoAdvance && (
              <Button
                size="lg"
                className="text-xl px-12 py-8 rounded-2xl shadow-lg"
                style={{ backgroundColor: step.color }}
                onClick={handleNext}
              >
                {step.action}
                <ArrowRight size={24} className="ml-3" />
              </Button>
            )}

            {step.autoAdvance && (
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 border-4 rounded-full animate-spin"
                  style={{ 
                    borderColor: step.color,
                    borderTopColor: 'transparent'
                  }}
                />
                <p className="text-gray-600">Procesando...</p>
              </div>
            )}
          </div>
        </Card>

        {/* Info Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 shadow-md">
            <h4 className="font-semibold text-gray-800 mb-2">Configuración de Voz</h4>
            <p className="text-sm text-gray-600">Idioma: Español</p>
            <p className="text-sm text-gray-600">Velocidad: Normal</p>
          </Card>
          <Card className="p-4 shadow-md">
            <h4 className="font-semibold text-gray-800 mb-2">Personalización</h4>
            <p className="text-sm text-gray-600">Tema: Walmart Corporativo</p>
            <p className="text-sm text-gray-600">Colores: Azul Seagull</p>
          </Card>
          <Card className="p-4 shadow-md">
            <h4 className="font-semibold text-gray-800 mb-2">Tiempo Promedio</h4>
            <p className="text-sm text-gray-600">Duración: 25-30 segundos</p>
            <p className="text-sm text-gray-600">Eficiencia: 95%</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SelfServicePage;