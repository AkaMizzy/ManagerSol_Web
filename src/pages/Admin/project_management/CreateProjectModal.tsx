import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface Zone {
  id: string;
  title: string;
  code: string;
}

interface CreateProjectModalProps {
  zones: Zone[];
  companyId: string;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  zones,
  companyId,
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    dd: '',
    df: '',
    id_zone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {} as any;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.dd) {
      newErrors.dd = 'La date de début est requise';
    }

    if (!formData.df) {
      newErrors.df = 'La date de fin est requise';
    }

    if (formData.dd && formData.df && new Date(formData.dd) >= new Date(formData.df)) {
      newErrors.df = 'La date de fin doit être après la date de début';
    }

    if (!formData.id_zone) {
      newErrors.id_zone = 'La zone est requise';
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
      const response = await fetch('http://localhost:5000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          ...formData,
          id_company: companyId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create the project object with zone information
        const newProject = {
          id: result.projectId,
          title: formData.title,
          id_company: companyId,
          dd: formData.dd,
          df: formData.df,
          id_zone: formData.id_zone,
          zone_title: zones.find(z => z.id === formData.id_zone)?.title || '',
          zone_code: zones.find(z => z.id === formData.id_zone)?.code || ''
        };

        onProjectCreated(newProject);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Erreur lors de la création du projet');
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
            Créer un nouveau projet
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nom du projet"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dd">Date de début *</Label>
              <Input
                id="dd"
                type="date"
                value={formData.dd}
                onChange={(e) => handleInputChange('dd', e.target.value)}
                className={errors.dd ? 'border-red-500' : ''}
              />
              {errors.dd && (
                <p className="text-sm text-red-500">{errors.dd}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="df">Date de fin *</Label>
              <Input
                id="df"
                type="date"
                value={formData.df}
                onChange={(e) => handleInputChange('df', e.target.value)}
                className={errors.df ? 'border-red-500' : ''}
              />
              {errors.df && (
                <p className="text-sm text-red-500">{errors.df}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone">Zone *</Label>
            <Select
              value={formData.id_zone}
              onValueChange={(value) => handleInputChange('id_zone', value)}
            >
              <SelectTrigger className={errors.id_zone ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner une zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.title} ({zone.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_zone && (
              <p className="text-sm text-red-500">{errors.id_zone}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le projet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal; 