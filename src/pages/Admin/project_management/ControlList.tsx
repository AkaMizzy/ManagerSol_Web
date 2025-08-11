import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Edit, Trash2, MoreHorizontal, Users, Calendar, MapPin, FolderOpen } from 'lucide-react';
import EditControlModal from './EditControlModal';

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

interface ControlListProps {
  controls: Control[];
  onControlDeleted: (controlId: string) => void;
  onRefresh: () => void;
}

const ControlList: React.FC<ControlListProps> = ({ 
  controls, 
  onControlDeleted, 
  onRefresh 
}) => {
  const [editingControl, setEditingControl] = useState<Control | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'bg-blue-100 text-blue-800';
    if (now > end) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'À venir';
    if (now > end) return 'Terminé';
    return 'En cours';
  };

  const handleDelete = async (controlId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/controls/${controlId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onControlDeleted(controlId);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting control:', error);
      alert('Erreur lors de la suppression de l\'affectation');
    }
  };

  const handleEdit = (control: Control) => {
    setEditingControl(control);
  };

  const handleControlUpdated = () => {
    setEditingControl(null);
    onRefresh();
  };

  if (controls.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucune affectation</h3>
            <p className="text-sm">Commencez par assigner des contrôles aux utilisateurs</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {controls.length} affectation{controls.length > 1 ? 's' : ''} au total
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Projet</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Groupe de tâches</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {controls.map((control) => (
              <TableRow key={control.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">
                        {control.firstname} {control.lastname}
                      </div>
                      <div className="text-sm text-gray-500">{control.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                    <div className="font-medium">{control.project_title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div className="font-medium">{control.zone_title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{control.taskgroup_title}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Du: {formatDate(control.dd)}</div>
                    <div>Au: {formatDate(control.df)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(control.dd, control.df)}>
                    {getStatusText(control.dd, control.df)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(control)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(control.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingControl && (
        <EditControlModal
          control={editingControl}
          onClose={() => setEditingControl(null)}
          onControlUpdated={handleControlUpdated}
        />
      )}
    </div>
  );
};

export default ControlList; 