import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundImage: 'url(/images/login-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black opacity-30" />

      {/* Contenido */}
      <div className="relative z-10 w-full flex">
        {/* Columna Izquierda - Welcome */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16">
          <div>
            {/* Logo Walmart */}
            <div className="mb-12">
              <img 
                src="/images/logowalmart.png" 
                alt="Walmart Logo" 
                className="h-16 w-auto"
              />
            </div>

            {/* Welcome Message */}
            <div className="mt-24">
              <h1 className="text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}>
                Bienvenido
                <br />
                de nuevo
              </h1>
              <p className="text-white text-lg leading-relaxed max-w-md opacity-90">
                Sistema integral de gestión de balanzas para Walmart Chile. 
                Controla, monitorea y optimiza tu red de equipos en tiempo real.
              </p>
            </div>
          </div>

          {/* Logo Alcom en la parte inferior */}
          <div>
            <img 
              src="/images/logo_allcom.jpg" 
              alt="Alcom Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div 
              className="backdrop-blur-xl bg-white/95 p-10 rounded-2xl shadow-2xl"
              style={{ animation: 'fadeIn 0.5s ease-out' }}
            >
              {/* Título del formulario */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600">BM MANAGER - Sistema de Gestión de Balanzas</p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="admin@walmart.cl"
                    className="mt-2 h-12 text-base"
                    style={{ backgroundColor: 'white' }}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    defaultValue="••••••••"
                    className="mt-2 h-12 text-base"
                    style={{ backgroundColor: 'white' }}
                  />
                </div>

                {/* Remember me */}
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#0071CE' }}
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Recordarme
                  </label>
                </div>

                {/* Botón de login */}
                <Button 
                  data-testid="login-button"
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ 
                    backgroundColor: '#FFC220',
                    color: '#000'
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Ingresar ahora'
                  )}
                </Button>

                {/* Lost password */}
                <div className="text-center">
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Footer del formulario */}
                <div className="text-center text-xs text-gray-500 pt-4">
                  <p>
                    Al iniciar sesión, aceptas nuestros{' '}
                    <a href="#" className="text-blue-600 hover:underline">Términos de Servicio</a>
                    {' '}y{' '}
                    <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a>
                  </p>
                </div>
              </form>
            </div>

            {/* Copyright */}
            <div className="mt-6 text-center text-sm text-white">
              <p className="drop-shadow-lg">© 2025 Walmart Chile - Alcon Technologies</p>
              <p className="mt-1 drop-shadow-lg opacity-90">Versión 1.0 | Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;