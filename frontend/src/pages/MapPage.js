import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// 3D Supermarket Floor Plan Component
const SupermarketFloorPlan = () => {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [selectedScale, setSelectedScale] = useState(null);

  const balanceLocations = [
    { id: 1, section: 'Frutas y Verduras', x: 15, y: 20, z: 0, type: 'BMS', status: 'online', count: 3 },
    { id: 2, section: 'Panadería', x: 70, y: 15, z: 0, type: 'Autoservicio', status: 'online', count: 2 },
    { id: 3, section: 'Pescadería', x: 15, y: 65, z: 0, type: 'BMS', status: 'online', count: 3 },
    { id: 4, section: 'Rotisería', x: 45, y: 70, z: 0, type: 'IA', status: 'online', count: 2 },
    { id: 5, section: 'Carnes', x: 70, y: 65, z: 0, type: 'BMS', status: 'online', count: 2 },
    { id: 6, section: 'Lácteos', x: 45, y: 20, z: 0, type: 'Autoservicio', status: 'online', count: 1 },
  ];

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      setRotation(prev => ({
        x: prev.x + e.movementY * 0.5, // Sin límites ahora
        y: prev.y + e.movementX * 0.5
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={() => setRotation({ x: -20, y: 45 })}>
          Vista Frontal
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRotation({ x: -40, y: 0 })}>
          Vista Superior
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRotation({ x: -20, y: 90 })}>
          Vista Lateral
        </Button>
      </div>

      {/* 3D Container */}
      <div 
        className="relative bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg overflow-hidden"
        style={{ height: '600px', perspective: '1200px', cursor: 'grab' }}
        onMouseMove={handleMouseMove}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s ease',
            width: '800px',
            height: '600px'
          }}
        >
          {/* Floor */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: '#f8fafc',
              border: '2px solid #cbd5e1',
              boxShadow: '0 10px 50px rgba(0,0,0,0.1)',
              transform: 'translateZ(0px)',
            }}
          >
            {/* Grid lines */}
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Walls - 4 muros */}
          {/* Muro frontal (frente) */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100px',
              backgroundColor: '#dbeafe',
              border: '2px solid #3b82f6',
              transform: 'translateY(0) rotateX(90deg)',
              transformOrigin: 'top',
              boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.2)'
            }}
          />
          
          {/* Muro trasero (atrás) */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100px',
              backgroundColor: '#dbeafe',
              border: '2px solid #3b82f6',
              transform: 'translateY(600px) rotateX(90deg)',
              transformOrigin: 'bottom',
              boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.2)'
            }}
          />
          
          {/* Muro izquierdo */}
          <div
            style={{
              position: 'absolute',
              width: '600px',
              height: '100px',
              backgroundColor: '#dbeafe',
              border: '2px solid #3b82f6',
              transform: 'translateX(0) rotateY(90deg)',
              transformOrigin: 'left',
              boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.2)'
            }}
          />
          
          {/* Muro derecho */}
          <div
            style={{
              position: 'absolute',
              width: '600px',
              height: '100px',
              backgroundColor: '#dbeafe',
              border: '2px solid #3b82f6',
              transform: 'translateX(800px) rotateY(90deg)',
              transformOrigin: 'right',
              boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.2)'
            }}
          />

          {/* Section Areas */}
          <div
            style={{
              position: 'absolute',
              left: '10%',
              top: '10%',
              width: '25%',
              height: '30%',
              backgroundColor: 'rgba(134, 239, 172, 0.3)',
              border: '2px solid #10b981',
              borderRadius: '8px',
              transform: 'translateZ(1px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#047857'
            }}
          >
            Frutas y Verduras
          </div>

          <div
            style={{
              position: 'absolute',
              left: '65%',
              top: '5%',
              width: '25%',
              height: '25%',
              backgroundColor: 'rgba(254, 215, 170, 0.3)',
              border: '2px solid #f97316',
              borderRadius: '8px',
              transform: 'translateZ(1px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#c2410c'
            }}
          >
            Panadería
          </div>

          <div
            style={{
              position: 'absolute',
              left: '10%',
              top: '55%',
              width: '25%',
              height: '30%',
              backgroundColor: 'rgba(147, 197, 253, 0.3)',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              transform: 'translateZ(1px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#1e40af'
            }}
          >
            Pescadería
          </div>

          <div
            style={{
              position: 'absolute',
              left: '40%',
              top: '60%',
              width: '20%',
              height: '25%',
              backgroundColor: 'rgba(252, 211, 77, 0.3)',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              transform: 'translateZ(1px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#92400e'
            }}
          >
            Rotisería
          </div>

          <div
            style={{
              position: 'absolute',
              left: '65%',
              top: '55%',
              width: '25%',
              height: '30%',
              backgroundColor: 'rgba(248, 113, 113, 0.3)',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              transform: 'translateZ(1px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#991b1b'
            }}
          >
            Carnes
          </div>

          <div
            style={{
              position: 'absolute',
              left: '40%',
              top: '10%',
              width: '20%',
              height: '25%',
              backgroundColor: 'rgba(196, 181, 253, 0.3)',
              border: '2px solid #8b5cf6',
              borderRadius: '8px',
              transform: 'translateZ(1px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#5b21b6'
            }}
          >
            Lácteos
          </div>

          {/* Balance Markers */}
          {balanceLocations.map((scale) => (
            <div
              key={scale.id}
              style={{
                position: 'absolute',
                left: `${scale.x}%`,
                top: `${scale.y}%`,
                width: '40px',
                height: '40px',
                transform: `translateZ(${scale.z + 15}px)`,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onClick={() => setSelectedScale(scale)}
              onMouseEnter={(e) => e.currentTarget.style.transform = `translateZ(${scale.z + 25}px) scale(1.2)`}
              onMouseLeave={(e) => e.currentTarget.style.transform = `translateZ(${scale.z + 15}px) scale(1)`}
            >
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: scale.type === 'IA' ? '#8b5cf6' : scale.type === 'Autoservicio' ? '#f59e0b' : '#0071CE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '3px solid white'
              }}>
                ⚖️
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                x{scale.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Scale Info */}
      {selectedScale && (
        <Card className="p-4 bg-blue-50 border-2 border-blue-300">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{selectedScale.section}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-semibold">Tipo:</span> {selectedScale.type}</p>
                <p><span className="font-semibold">Cantidad:</span> {selectedScale.count} balanza{selectedScale.count > 1 ? 's' : ''}</p>
                <p><span className="font-semibold">Estado:</span> <span className="text-green-600 font-semibold">En línea</span></p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setSelectedScale(null)}>
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0071CE' }} />
          <span className="text-sm">BMS Asistida</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
          <span className="text-sm">Autoservicio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
          <span className="text-sm">IA</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 italic">💡 Arrastra con el mouse para rotar la vista del supermercado</p>
    </div>
  );
};

const MapPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data);
    } catch (error) {
      toast.error('Error al cargar locales');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (salesLevel) => {
    switch (salesLevel) {
      case 'high': return '#047857'; // green-800
      case 'medium': return '#10b981'; // green-500
      case 'low': return '#6ee7b7'; // green-300
      default: return '#10b981';
    }
  };

  const createCustomIcon = (store, localCode) => {
    const color = getMarkerColor(store.sales_level);
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            color: white;
            font-weight: bold;
            font-size: 11px;
            transform: rotate(45deg);
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          ">${localCode}</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  const filteredStores = filterLevel === 'all' 
    ? stores 
    : stores.filter(s => s.sales_level === filterLevel);

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="p-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Mapa de Locales</h1>
          <p className="text-gray-600 mt-1">Visualización geográfica de todas las sucursales</p>
        </div>

        {/* Legend & Filters */}
        <Card className="p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <p className="font-semibold text-gray-700">Nivel de Ventas:</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#047857' }} />
                <span className="text-sm">Alto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }} />
                <span className="text-sm">Medio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6ee7b7' }} />
                <span className="text-sm">Bajo</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={filterLevel === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('all')}
                style={filterLevel === 'all' ? { backgroundColor: '#79b9e7' } : {}}
              >
                Todos ({stores.length})
              </Button>
              <Button 
                size="sm" 
                variant={filterLevel === 'high' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('high')}
                style={filterLevel === 'high' ? { backgroundColor: '#047857', color: 'white' } : {}}
              >
                Alto
              </Button>
              <Button 
                size="sm" 
                variant={filterLevel === 'medium' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('medium')}
                style={filterLevel === 'medium' ? { backgroundColor: '#10b981', color: 'white' } : {}}
              >
                Medio
              </Button>
              <Button 
                size="sm" 
                variant={filterLevel === 'low' ? 'default' : 'outline'}
                onClick={() => setFilterLevel('low')}
                style={filterLevel === 'low' ? { backgroundColor: '#6ee7b7', color: 'white' } : {}}
              >
                Bajo
              </Button>
            </div>
          </div>
        </Card>

        {/* Map */}
        <Card className="flex-1 overflow-hidden shadow-lg mb-6">
          <MapContainer 
            center={[-33.4489, -70.6693]} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredStores.map((store, idx) => {
              // Extract 3-digit code from store name or use index
              const localCode = store.sap_code ? store.sap_code.split('-')[1].slice(-3) : (idx + 1).toString().padStart(3, '0');
              return (
                <Marker 
                  key={store.id} 
                  position={[store.latitude, store.longitude]}
                  icon={createCustomIcon(store, localCode)}
                >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2">{store.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{store.comuna}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Código SAP:</span>
                        <span className="font-semibold">{store.sap_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BMS Asistida:</span>
                        <Badge variant="outline">{store.balances_bms}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Autoservicio:</span>
                        <Badge variant="outline">{store.balances_autoservicio}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balanzas IA:</span>
                        <Badge style={{ backgroundColor: '#79b9e7', color: 'white' }}>{store.balances_ia}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full status-${store.status}`} />
                          <span className="capitalize text-xs">
                            {store.status === 'online' ? 'En línea' : store.status === 'partial' ? 'Parcial' : 'Desconectado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-3"
                      style={{ backgroundColor: '#79b9e7' }}
                      onClick={() => navigate(`/store/${store.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </Popup>
              </Marker>
              );
            })}
          </MapContainer>
        </Card>

        {/* 3D Supermarket Floor Plan */}
        <Card className="p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Plano 3D del Supermercado
            </h2>
            <p className="text-gray-600 mt-1">Vista interactiva de ubicación de balanzas por sección</p>
          </div>
          
          <SupermarketFloorPlan />
        </Card>
      </div>
    </Layout>
  );
};

export default MapPage;