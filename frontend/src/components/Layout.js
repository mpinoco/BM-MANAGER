import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Map, Megaphone, Workflow, FileText, LogOut, Menu, X, Zap, Package, HardDrive, BrainCircuit, Leaf, AlertTriangle, TrendingUp, Recycle, ShoppingCart } from 'lucide-react';

const Layout = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Map, label: 'Mapa', path: '/map' },
    { icon: Zap, label: 'Recursos', path: '/consumption' },
    { icon: Package, label: 'Insumos', path: '/supplies' },
    { icon: HardDrive, label: 'Activos', path: '/assets' },
    { icon: Megaphone, label: 'Campañas', path: '/campaigns' },
    { icon: Workflow, label: 'Autoservicio', path: '/self-service' },
    { icon: BrainCircuit, label: 'Menú IA', path: '/ai-menu' },
    { icon: Leaf, label: 'Sostenibilidad', path: '/sustainability' },
    { icon: AlertTriangle, label: 'Obsolescencia', path: '/obsolescence' },
    { icon: TrendingUp, label: 'Ventas & Análisis', path: '/sales-analysis' },
    { icon: Recycle, label: 'Mantenimiento Predictivo', path: '/predictive-maintenance' },
    { icon: FileText, label: 'Reportes & Auditoría', path: '/reports' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 shadow-xl flex flex-col`}
        style={{ 
          background: 'linear-gradient(180deg, #0071CE 0%, #004C8C 100%)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header with Walmart Logo */}
        <div className="p-5 border-b border-white/10">
          {sidebarOpen ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <img 
                  src="/images/logowalmart.png" 
                  alt="Walmart Logo" 
                  className="h-12 w-auto"
                />
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-1">
                <h2 className="text-white text-lg font-bold tracking-tight">BM MANAGER</h2>
                <p className="text-xs text-white/70">Sistema de Gestión de Balanzas</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-all w-full"
            >
              <Menu size={20} className="mx-auto" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white text-blue-600 shadow-lg font-semibold' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={19} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Allcom Text and Logout */}
        <div className="border-t border-white/10">
          {sidebarOpen && (
            <div className="p-4 text-center bg-white/5">
              <p className="text-white text-xs font-semibold tracking-wide">ALLCOM IA Technologies 2025</p>
              <p className="text-white/60 text-[10px] mt-0.5">Versión 1.1 2025</p>
            </div>
          )}
          <div className="p-3">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full flex items-center gap-3 text-white/90 hover:text-white hover:bg-white/10 justify-start px-4 py-2.5 rounded-xl transition-all"
            >
              <LogOut size={19} />
              {sidebarOpen && <span className="text-sm">Cerrar Sesión</span>}
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