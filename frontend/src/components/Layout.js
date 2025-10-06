import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Map, Megaphone, Workflow, FileText, LogOut, Menu, X, Zap, Package, HardDrive, BrainCircuit } from 'lucide-react';

const Layout = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Map, label: 'Mapa', path: '/map' },
    { icon: Zap, label: 'Consumo', path: '/consumption' },
    { icon: Package, label: 'Insumos', path: '/supplies' },
    { icon: HardDrive, label: 'Assets', path: '/assets' },
    { icon: Megaphone, label: 'Campañas', path: '/campaigns' },
    { icon: Workflow, label: 'Autoservicio', path: '/self-service' },
    { icon: BrainCircuit, label: 'Menú IA', path: '/ai-menu' },
    { icon: FileText, label: 'Reportes', path: '/reports' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 shadow-xl flex flex-col`}
        style={{ backgroundColor: '#0071CE' }}
      >
        {/* Header with Walmart Logo */}
        <div className="p-4 border-b border-blue-700">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <img 
                src="/images/logowalmart.png" 
                alt="Walmart Logo" 
                className="h-10 w-auto"
              />
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors w-full"
            >
              <Menu size={20} className="mx-auto" />
            </button>
          )}
          {sidebarOpen && (
            <div className="mt-2">
              <h2 className="text-white text-lg font-bold">BM MANAGER</h2>
              <p className="text-xs text-blue-200">Sistema de Gestión de Balanzas</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Alcom Logo and Logout */}
        <div className="border-t border-blue-700">
          {sidebarOpen && (
            <div className="p-4 flex items-center justify-center">
              <img 
                src="/images/logo_allcom.jpg" 
                alt="Alcom Logo" 
                className="h-8 w-auto"
              />
            </div>
          )}
          <div className="p-3">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full flex items-center gap-3 text-white hover:bg-blue-700 justify-start px-4"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Cerrar Sesión</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;