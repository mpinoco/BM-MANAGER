import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, CheckCircle2, Info, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const NewBalanceForm = ({ stores, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    localSAP: '',
    address: '',
    comuna: '',
    brand: '',
    type: 'Asistida',
    paperType: 'Liner',
    serialNumber: '',
    installationDate: new Date().toISOString().split('T')[0],
    provider: 'Allcom Chile',
    checklist: {
      calibrated: false,
      leveled: false,
      cablesSecured: false,
      desirableHeight: false,
      firmwareUpdated: false
    },
    ipAddress: '',
    macAddress: '',
    providerKey: '',
    jsonIAKey: ''
  });

  // Scale brands
  const scaleBrands = [
    'Marques',
    'Dibal',
    'Digi',
    'Bizerba',
    'Mettler Toledo',
    'Covitel'
  ];

  // Scale types
  const scaleTypes = [
    'Asistida',
    'Autoservicio',
    'Balanza IA'
  ];

  // Paper types  
  const paperTypes = [
    'Liner',
    'Linerless'
  ];

  // Providers
  const providers = [
    'Allcom Chile',
    'MEGARETAIL',
    'HOBART',
    'DIBAL'
  ];

  // Pre-loaded JSON/IA key examples
  const exampleKeys = [
    'A1B2C3D4E5F6',
    '9FA0BCD12345', 
    '12AB34CD56EF',
    '0FAB1C2D3E4F'
  ];

  // Get random example key
  const getRandomExampleKey = () => {
    return exampleKeys[Math.floor(Math.random() * exampleKeys.length)];
  };

  const handleLocalChange = (sapCode) => {
    const selectedStore = stores.find(s => s.sap_code === sapCode);
    if (selectedStore) {
      setFormData({
        ...formData,
        localSAP: sapCode,
        address: selectedStore.address,
        comuna: selectedStore.comuna
      });
    }
  };

  const handleChecklistChange = (field) => {
    setFormData({
      ...formData,
      checklist: {
        ...formData.checklist,
        [field]: !formData.checklist[field]
      }
    });
  };

  const validateForm = () => {
    if (!formData.localSAP) {
      toast.error('Debe seleccionar un local');
      return false;
    }
    if (!formData.brand) {
      toast.error('Debe seleccionar una marca de balanza');
      return false;
    }
    if (!formData.serialNumber || formData.serialNumber.length < 8) {
      toast.error('Número de serie inválido (mínimo 8 caracteres)');
      return false;
    }
    if (!formData.ipAddress) {
      toast.error('La dirección IP es obligatoria');
      return false;
    }
    if (!formData.macAddress) {
      toast.error('La dirección MAC es obligatoria');
      return false;
    }
    if (formData.jsonIAKey && formData.jsonIAKey.length !== 12) {
      toast.error('La clave JSON/IA debe tener exactamente 12 caracteres hexadecimales');
      return false;
    }
    if (formData.jsonIAKey && !/^[A-F0-9]{12}$/i.test(formData.jsonIAKey)) {
      toast.error('La clave JSON/IA debe contener solo caracteres hexadecimales (0-9, A-F)');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedStore = stores.find(s => s.sap_code === formData.localSAP);
    const newBalance = {
      ...formData,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      storeComuna: selectedStore.comuna,
      status: 'online',
      firmware_version: formData.checklist.firmwareUpdated ? 'v2.3.1' : 'v2.2.5',
      last_calibration: formData.checklist.calibrated ? new Date().toISOString() : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      avg_consumption: 1.8,
      label_status: 'good',
      printhead_life: 100
    };

    onSave(newBalance);
  };

  const checklistComplete = Object.values(formData.checklist).filter(Boolean).length;
  const checklistTotal = Object.keys(formData.checklist).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Configurar Nueva Balanza
            </h2>
            <p className="text-gray-600 text-sm">Complete todos los campos para registrar el equipo</p>
          </div>
        </div>
        <Badge 
          className="px-4 py-2"
          style={{ 
            backgroundColor: checklistComplete === checklistTotal ? '#10b981' : '#f59e0b',
            color: 'white'
          }}
        >
          Checklist: {checklistComplete}/{checklistTotal}
        </Badge>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 - Información del Local */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-8" style={{ backgroundColor: '#0071CE' }} />
            Información del Local
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="localSAP" className="text-sm font-medium">
                Local SAP <span className="text-red-500">*</span>
              </Label>
              <select
                id="localSAP"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.localSAP}
                onChange={(e) => handleLocalChange(e.target.value)}
              >
                <option value="">Seleccione un local...</option>
                {stores.map(store => (
                  <option key={store.id} value={store.sap_code}>
                    {store.sap_code} - {store.name} ({store.comuna})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1 text-sm"
                placeholder="Dirección del local"
              />
            </div>

            <div>
              <Label htmlFor="comuna" className="text-sm font-medium">Comuna</Label>
              <Input
                id="comuna"
                value={formData.comuna}
                onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                className="mt-1 text-sm"
                placeholder="Comuna"
              />
            </div>
          </div>
        </Card>

        {/* Column 2 - Datos del Equipo */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-8" style={{ backgroundColor: '#FFC220' }} />
            Datos del Equipo
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand" className="text-sm font-medium">
                Marca de la Balanza <span className="text-red-500">*</span>
              </Label>
              <select
                id="brand"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              >
                <option value="">Seleccione una marca...</option>
                {scaleBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo de Balanza <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {scaleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="paperType" className="text-sm font-medium">
                Tipo de Papel <span className="text-red-500">*</span>
              </Label>
              <select
                id="paperType"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.paperType}
                onChange={(e) => setFormData({...formData, paperType: e.target.value})}
              >
                {paperTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="serialNumber" className="text-sm font-medium">
                Número de Serie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value.toUpperCase()})}
                className="mt-1 text-sm font-mono"
                placeholder="BMCL-9E998776"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">Formato: BMCL-XXXXXXXX</p>
            </div>

            <div>
              <Label htmlFor="installationDate" className="text-sm font-medium">
                Fecha de Instalación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="installationDate"
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({...formData, installationDate: e.target.value})}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="provider" className="text-sm font-medium">Proveedor</Label>
              <select
                id="provider"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
              >
                {providers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Column 3 - Datos Técnicos */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-8" style={{ backgroundColor: '#1B4D89' }} />
            Datos Técnicos
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ipAddress" className="text-sm font-medium">
                Dirección IP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
                className="mt-1 text-sm font-mono"
                placeholder="192.168.1.100"
              />
            </div>

            <div>
              <Label htmlFor="macAddress" className="text-sm font-medium">
                Dirección MAC <span className="text-red-500">*</span>
              </Label>
              <Input
                id="macAddress"
                value={formData.macAddress}
                onChange={(e) => setFormData({...formData, macAddress: e.target.value.toUpperCase()})}
                className="mt-1 text-sm font-mono"
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>

            <div>
              <Label htmlFor="providerKey" className="text-sm font-medium">
                Clave del Proveedor
              </Label>
              <Input
                id="providerKey"
                value={formData.providerKey}
                onChange={(e) => setFormData({...formData, providerKey: e.target.value})}
                className="mt-1 text-sm font-mono"
                placeholder="Clave proporcionada por el fabricante"
              />
              <p className="text-xs text-gray-500 mt-1">Clave de conexión del fabricante</p>
            </div>

            {/* Checklist */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-3 block">Condiciones de Instalación</Label>
              <div className="space-y-2">
                {[
                  { key: 'calibrated', label: 'Calibrada' },
                  { key: 'leveled', label: 'Nivelada' },
                  { key: 'cablesSecured', label: 'Cables amarrados' },
                  { key: 'desirableHeight', label: 'Altura deseable' },
                  { key: 'firmwareUpdated', label: 'Firmware actualizado' }
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={formData.checklist[item.key]}
                      onChange={() => handleChecklistChange(item.key)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#0071CE' }}
                    />
                    <label htmlFor={item.key} className="text-sm text-gray-700 flex items-center gap-2">
                      {formData.checklist[item.key] && <CheckCircle2 size={14} className="text-green-600" />}
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* JSON/IA Key Section - Only show when brand is selected */}
      {formData.brand && (
        <Card className="p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Clave JSON / IA - {formData.brand}
            </h3>
            <div className="group relative">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute left-0 top-6 w-80 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                Esta clave se utilizará para integrar la balanza multimarca mediante APIs de JSON/IA. 
                Debe ser una cadena hexadecimal de 12 caracteres proporcionada por el fabricante.
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jsonIAKey" className="text-sm font-medium">
                Clave JSON / IA
              </Label>
              <Input
                id="jsonIAKey"
                value={formData.jsonIAKey}
                onChange={(e) => setFormData({...formData, jsonIAKey: e.target.value.toUpperCase()})}
                className="mt-1 text-sm font-mono"
                placeholder="A1B2C3D4E5F6"
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">12 caracteres hexadecimales (0-9, A-F)</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Ejemplos de formato:</Label>
              <div className="mt-1 space-y-1">
                {exampleKeys.map((key, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {key}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setFormData({...formData, jsonIAKey: key})}
                    >
                      Usar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Información importante:</strong> Esta clave permite la integración 
                con balanzas multimarca a través de APIs JSON/IA. Debe ser proporcionada 
                por el fabricante {formData.brand} para garantizar la compatibilidad completa.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="p-6 shadow-lg">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            <X size={18} className="mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6"
            style={{ backgroundColor: '#0071CE', color: 'white' }}
          >
            <Save size={18} className="mr-2" />
            Guardar Balanza
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NewBalanceForm;
