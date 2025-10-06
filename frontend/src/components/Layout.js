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
        style={{ backgroundColor: '#79b9e7' }}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && (
            <div className="text-white">
              <h2 className="text-2xl font-bold">BM MANAGER</h2>
              <p className="text-xs text-sky-100">Walmart Chile</p>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-sky-600 p-2 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-white text-sky-600 shadow-lg' 
                    : 'text-white hover:bg-sky-600'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full flex items-center gap-3 text-white hover:bg-sky-600 justify-start px-4"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </Button>
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