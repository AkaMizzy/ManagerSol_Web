import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectType { id: string; title: string; }

interface CreateProjectModalProps {
  companyId: string;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  companyId,
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    owner: '',
    status: 'planned',
    project_type_id: '',
    dd: '',
    df: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<ProjectType[]>([]);

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

  useEffect(() => {
    fetchTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/project-types', { headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.dd) newErrors.dd = 'La date de début est requise';
    if (!formData.df) newErrors.df = 'La date de fin est requise';
    if (formData.dd && formData.df && new Date(formData.dd) >= new Date(formData.df)) {
      newErrors.df = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          title: formData.title,
          code: formData.code || null,
          owner: formData.owner || null,
          status: formData.status || null,
          project_type_id: formData.project_type_id || null,
          dd: formData.dd,
          df: formData.df,
          id_company: companyId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = {
          id: result.projectId,
          title: formData.title,
          code: formData.code || null,
          owner: formData.owner || null,
          status: formData.status || null,
          project_type_id: formData.project_type_id || null,
          project_type_title: types.find(t => t.id === formData.project_type_id)?.title || '',
          id_company: companyId,
          dd: formData.dd,
          df: formData.df,
        };
        onProjectCreated(newProject);
        toast.success('Project created');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
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
            <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Nom du projet" className={errors.title ? 'border-red-500' : ''} />
            {errors.title && (<p className="text-sm text-red-500">{errors.title}</p>)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dd">Date de début *</Label>
              <Input id="dd" type="date" value={formData.dd} onChange={(e) => handleInputChange('dd', e.target.value)} className={errors.dd ? 'border-red-500' : ''} />
              {errors.dd && (<p className="text-sm text-red-500">{errors.dd}</p>)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="df">Date de fin *</Label>
              <Input id="df" type="date" value={formData.df} onChange={(e) => handleInputChange('df', e.target.value)} className={errors.df ? 'border-red-500' : ''} />
              {errors.df && (<p className="text-sm text-red-500">{errors.df}</p>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} placeholder="Code du projet" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Propriétaire</Label>
              <Input id="owner" value={formData.owner} onChange={(e) => handleInputChange('owner', e.target.value)} placeholder="Nom du propriétaire" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de projet</Label>
              <Select value={formData.project_type_id} onValueChange={(v) => handleInputChange('project_type_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on hold">On hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer le projet'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal; 