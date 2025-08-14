import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  id_company: string;
  dd: string;
  df: string;
  status?: string | null;
  project_type_title?: string | null;
  id_zone?: string | null;
  zone_title?: string | null;
  zone_code?: string | null;
}

interface Zone {
  id: string;
  title: string;
  code: string;
}

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  company_id: string;
}

interface TaskGroup {
  id: string;
  title: string;
}

interface CreateControlModalProps {
  projects: Project[];
  zones: Zone[];
  companyId: string;
  onClose: () => void;
  onControlCreated: (control: any) => void;
}

const CreateControlModal: React.FC<CreateControlModalProps> = ({
  projects,
  zones,
  companyId,
  onClose,
  onControlCreated
}) => {
  const [formData, setFormData] = useState({
    project: '',
    zone: '',
    taskgroup: '',
    dd: '',
    df: '',
    user: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

  useEffect(() => {
    fetchUsers();
    fetchTaskGroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.project) {
      const selectedProject = projects.find(p => p.id === formData.project);
      if (selectedProject) {
        setFormData(prev => ({ ...prev, zone: selectedProject.id_zone }));
      }
    }
  }, [formData.project, projects]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/company/${companyId}`, { headers: { 'Content-Type': 'application/json', ...authHeader } });
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTaskGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/task-group-models', { headers: { 'Content-Type': 'application/json', ...authHeader } });
      if (response.ok) {
        const taskGroupsData = await response.json();
        setTaskGroups(taskGroupsData);
      }
    } catch (error) {
      console.error('Error fetching task groups:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project) {
      newErrors.project = 'Le projet est requis';
    }

    if (!formData.zone) {
      newErrors.zone = 'La zone est requise';
    }

    if (!formData.taskgroup) {
      newErrors.taskgroup = 'Le groupe de tâches est requis';
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

    if (!formData.user) {
      newErrors.user = 'L\'utilisateur est requis';
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
      const response = await fetch('http://localhost:5000/controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Get the related data for the new control
        const selectedProject = projects.find(p => p.id === formData.project);
        const selectedZone = zones.find(z => z.id === formData.zone);
        const selectedTaskGroup = taskGroups.find(tg => tg.id === formData.taskgroup);
        const selectedUser = users.find(u => u.id === formData.user);

        if (selectedProject && selectedZone && selectedTaskGroup && selectedUser) {
          const newControl = {
            id: result.controlId,
            project: formData.project,
            zone: formData.zone,
            taskgroup: formData.taskgroup,
            dd: formData.dd,
            df: formData.df,
            user: formData.user,
            project_title: selectedProject.title,
            zone_title: selectedZone.title,
            taskgroup_title: selectedTaskGroup.title,
            firstname: selectedUser.firstname,
            lastname: selectedUser.lastname,
            email: selectedUser.email
          };

          onControlCreated(newControl);
          toast.success('Control assigned');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Échec de l'affectation");
      }
    } catch (error) {
      console.error('Error creating control:', error);
      toast.error("Erreur lors de l'affectation");
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Assigner un contrôle
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Projet *</Label>
              <Select
                value={formData.project}
                onValueChange={(value) => handleInputChange('project', value)}
              >
                <SelectTrigger className={errors.project ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.id && String(p.id).trim() !== '').map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project && (
                <p className="text-sm text-red-500">{errors.project}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone">Zone *</Label>
              <Select
                value={formData.zone}
                onValueChange={(value) => handleInputChange('zone', value)}
                disabled={!formData.project}
              >
                <SelectTrigger className={errors.zone ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Zone automatique" />
                </SelectTrigger>
                <SelectContent>
                  {zones.filter(z => z.id && String(z.id).trim() !== '').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.title} ({zone.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.zone && (
                <p className="text-sm text-red-500">{errors.zone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskgroup">Groupe de tâches *</Label>
              <Select
                value={formData.taskgroup}
                onValueChange={(value) => handleInputChange('taskgroup', value)}
              >
                <SelectTrigger className={errors.taskgroup ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un groupe" />
                </SelectTrigger>
                <SelectContent>
                  {taskGroups.filter(tg => tg.id && String(tg.id).trim() !== '').map((taskGroup) => (
                    <SelectItem key={taskGroup.id} value={taskGroup.id}>
                      {taskGroup.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.taskgroup && (
                <p className="text-sm text-red-500">{errors.taskgroup}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Utilisateur *</Label>
              <Select
                value={formData.user}
                onValueChange={(value) => handleInputChange('user', value)}
              >
                <SelectTrigger className={errors.user ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.id && String(u.id).trim() !== '').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstname} {user.lastname} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.user && (
                <p className="text-sm text-red-500">{errors.user}</p>
              )}
            </div>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Assigner le contrôle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateControlModal; 