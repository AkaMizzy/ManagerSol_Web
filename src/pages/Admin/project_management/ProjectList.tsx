import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreHorizontal, Calendar } from 'lucide-react';
import EditProjectModal from './EditProjectModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  id_company: string;
  dd: string;
  df: string;
  status?: string | null;
  project_type_title?: string | null;
}

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
  onRefresh: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onProjectDeleted, 
  onRefresh 
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    const projectId = pendingDelete.id;

    const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
    const auth = authRaw ? JSON.parse(authRaw) : null;
    const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

    try {
      const response = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        onProjectDeleted(projectId);
        toast.success('Project deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleProjectUpdated = () => {
    setEditingProject(null);
    onRefresh();
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucun projet</h3>
            <p className="text-sm">Commencez par créer votre premier projet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {projects.length} projet{projects.length > 1 ? 's' : ''} au total
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="font-medium">{project.title}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Du: {formatDate(project.dd)}</div>
                    <div>Au: {formatDate(project.df)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-800">{project.project_type_title || '—'}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-800">{project.status || '—'}</div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(project)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600" onSelect={(e) => { e.preventDefault(); setPendingDelete(project); }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le projet sera supprimé définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPendingDelete(null)}>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-600 text-white hover:bg-red-700">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
};

export default ProjectList; 