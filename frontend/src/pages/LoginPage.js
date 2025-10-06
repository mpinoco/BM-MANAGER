import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Store, TrendingUp } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-orange-50">
      <Card className="w-full max-w-md p-8 shadow-2xl animate-fade-in">
        {/* Logos */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Store className="w-12 h-12 text-white" />
            <span className="sr-only">Walmart Logo</span>
          </div>
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-12 h-12 text-white" />
            <span className="sr-only">Alcon Logo</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            BM MANAGER
          </h1>
          <p className="text-gray-600 text-lg">Sistema de Gestión de Balanzas</p>
        </div>

        {/* Login Info */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Usuario:</span> admin@walmart.cl
          </p>
          <p className="text-xs text-gray-500 mt-1">Acceso corporativo automático</p>
        </div>

        {/* Login Button */}
        <Button 
          data-testid="login-button"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-6 text-lg font-semibold rounded-xl shadow-lg"
          style={{ 
            backgroundColor: '#79b9e7',
            color: 'white'
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Iniciando sesión...
            </span>
          ) : (
            'Ingresar al Sistema'
          )}
        </Button>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 Walmart Chile - Alcon Technologies</p>
          <p className="mt-1">Versión 1.0 | Todos los derechos reservados</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;