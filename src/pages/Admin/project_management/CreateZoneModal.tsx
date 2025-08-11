import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface CreateZoneModalProps {
  onClose: () => void;
  onZoneCreated: (zone: any) => void;
}

const CreateZoneModal: React.FC<CreateZoneModalProps> = ({
  onClose,
  onZoneCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    latitude: '',
    longitude: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Le code ne doit pas dépasser 10 caractères';
    }

    if (formData.latitude && isNaN(Number(formData.latitude))) {
      newErrors.latitude = 'Latitude invalide';
    }
    if (formData.longitude && isNaN(Number(formData.longitude))) {
      newErrors.longitude = 'Longitude invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('code', formData.code);
      if (formData.latitude) body.append('latitude', formData.latitude);
      if (formData.longitude) body.append('longitude', formData.longitude);
      if (logoFile) body.append('logo', logoFile);

      const response = await fetch('http://localhost:5000/zones', {
        method: 'POST',
        headers: {
          ...authHeader,
        },
        body,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create the zone object
        const newZone = {
          id: result.zoneId,
          title: formData.title,
          code: formData.code,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          logo: result.logo || null
        };

        onZoneCreated(newZone);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
      alert('Erreur lors de la création de la zone');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Créer une nouvelle zone
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la zone *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nom de la zone"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code de la zone *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              placeholder="Code (ex: ZN, ZS)"
              maxLength={10}
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
            <p className="text-xs text-gray-500">
              Code court pour identifier la zone (max 10 caractères)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="ex: 33.589886"
                className={errors.latitude ? 'border-red-500' : ''}
              />
              {errors.latitude && (
                <p className="text-sm text-red-500">{errors.latitude}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="ex: -6.849813"
                className={errors.longitude ? 'border-red-500' : ''}
              />
              {errors.longitude && (
                <p className="text-sm text-red-500">{errors.longitude}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-gray-500">Image optionnelle pour la zone</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer la zone'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateZoneModal; 