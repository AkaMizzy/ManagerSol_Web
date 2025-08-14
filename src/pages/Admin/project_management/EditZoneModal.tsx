import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Zone {
  id: string;
  title: string;
  code: string;
  id_zone?: string | null;
  level?: number;
  zone_type_id?: string | null;
}

interface EditZoneModalProps {
  zone: Zone;
  onClose: () => void;
  onZoneUpdated: () => void;
}

interface ZoneType { id: string; intitule: string }

const EditZoneModal: React.FC<EditZoneModalProps> = ({
  zone,
  onClose,
  onZoneUpdated
}) => {
  const [formData, setFormData] = useState({
    title: zone.title,
    code: zone.code,
    id_zone: zone.id_zone || '',
    zone_type_id: zone.zone_type_id || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneTypes, setZoneTypes] = useState<ZoneType[]>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.code.trim()) newErrors.code = 'Le code est requis';
    else if (formData.code.length > 10) newErrors.code = 'Le code ne doit pas dépasser 10 caractères';
    if (!formData.zone_type_id) newErrors.zone_type_id = 'Type de zone requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/zones'),
      fetch('http://localhost:5000/zone-types')
    ])
      .then(async ([rz, rt]) => {
        const zs = rz.ok ? await rz.json() : [];
        const ts = rt.ok ? await rt.json() : [];
        setZones(zs || []);
        setZoneTypes(ts || []);
      })
      .catch(() => { setZones([]); setZoneTypes([]); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

      const response = await fetch(`http://localhost:5000/zones/${zone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onZoneUpdated();
        toast.success('Zone updated');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update zone');
      }
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('Erreur lors de la modification de la zone');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Modifier la zone
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la zone *</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Nom de la zone" className={errors.title ? 'border-red-500' : ''} />
            {errors.title && (<p className="text-sm text-red-500">{errors.title}</p>)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code de la zone *</Label>
            <Input id="code" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())} placeholder="Code (ex: ZN, ZS)" maxLength={10} className={errors.code ? 'border-red-500' : ''} />
            {errors.code && (<p className="text-sm text-red-500">{errors.code}</p>)}
            <p className="text-xs text-gray-500">Code court pour identifier la zone (max 10 caractères)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoneType">Type de zone *</Label>
            <select id="zoneType" className={`w-full border rounded h-9 px-2 ${errors.zone_type_id ? 'border-red-500' : ''}`} value={formData.zone_type_id} onChange={(e) => handleInputChange('zone_type_id', e.target.value)}>
              <option value="">— Sélectionner —</option>
              {zoneTypes.map((t) => (<option key={t.id} value={t.id}>{t.intitule}</option>))}
            </select>
            {errors.zone_type_id && (<p className="text-sm text-red-500">{errors.zone_type_id}</p>)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Zone parente (optionnel)</Label>
            <select id="parent" className="w-full border rounded h-9 px-2" value={formData.id_zone} onChange={(e) => handleInputChange('id_zone', e.target.value)}>
              <option value="">— Aucune —</option>
              {zones.filter((z) => z.id !== zone.id).map((z: any) => (<option key={z.id} value={z.id}>{z.title}</option>))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Modification...' : 'Modifier la zone'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditZoneModal; 