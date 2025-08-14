import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Control {
  id: string;
  project: string;
  zone: string;
  taskgroup: string;
  dd: string;
  df: string;
  user: string;
  project_title: string;
  zone_title: string;
  taskgroup_title: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  company_id: string;
}

interface EditControlModalProps {
  control: Control;
  onClose: () => void;
  onControlUpdated: () => void;
}

const EditControlModal: React.FC<EditControlModalProps> = ({
  control,
  onClose,
  onControlUpdated
}) => {
  const [formData, setFormData] = useState({
    dd: control.dd,
    df: control.df,
    user: control.user
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const companyId = localStorage.getItem('companyId') || '';
      if (companyId) {
        const response = await fetch(`http://localhost:5000/users/company/${companyId}`, { headers: { 'Content-Type': 'application/json', ...authHeader } });
        if (response.ok) {
          const usersData = await response.json();
          // Filter out entries with falsy/empty ids to protect Select
          setUsers((usersData || []).filter((u: User) => u && typeof u.id === 'string' && u.id.trim().length > 0));
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.dd) newErrors.dd = 'La date de début est requise';
    if (!formData.df) newErrors.df = 'La date de fin est requise';
    if (formData.dd && formData.df && new Date(formData.dd) >= new Date(formData.df)) newErrors.df = 'La date de fin doit être après la date de début';
    if (!formData.user) newErrors.user = "L'utilisateur est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/controls/${control.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onControlUpdated();
        toast.success('Control updated');
      } else {
        const error = await response.json();
        toast.error(error.error || "Échec de la modification");
      }
    } catch (error) {
      console.error('Error updating control:', error);
      toast.error("Erreur lors de la modification de l'affectation");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Modifier l'affectation
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Projet</Label>
                <p className="text-sm">{control.project_title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Zone</Label>
                <p className="text-sm">{control.zone_title}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Groupe de tâches</Label>
              <p className="text-sm">{control.taskgroup_title}</p>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="user">Utilisateur *</Label>
            <Select value={formData.user} onValueChange={(value) => handleInputChange('user', value)}>
              <SelectTrigger className={errors.user ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => u && typeof u.id === 'string' && u.id.trim().length > 0)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstname} {user.lastname} ({user.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.user && (<p className="text-sm text-red-500">{errors.user}</p>)}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Modification...' : "Modifier l'affectation"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditControlModal; 