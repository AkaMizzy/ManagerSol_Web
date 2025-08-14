import React, { useMemo, useState } from 'react';
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
import { Edit, Trash2, MoreHorizontal, MapPin, Image as ImageIcon, Shapes, Globe, Map, Building2, Landmark, Home } from 'lucide-react';
import EditZoneModal from './EditZoneModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import ZoneTree from './ZoneTree';

interface Zone {
  id: string;
  title: string;
  code: string;
  latitude?: string | null;
  longitude?: string | null;
  logo?: string | null;
  zone_type_title?: string | null;
}

interface ZoneListProps {
  zones: Zone[];
  onZoneDeleted: (zoneId: string) => void;
  onRefresh: () => void;
}

const getTypeIcon = (zoneType?: string | null) => {
  const t = (zoneType || '').toLowerCase();
  if (t.includes('région') || t.includes('region')) return Globe;
  if (t.includes('province')) return Map;
  if (t.includes('ville') || t.includes('city')) return Building2;
  if (t.includes('arrondissement') || t.includes('district')) return Landmark;
  if (t.includes('quartier') || t.includes('neighbour') || t.includes('neighborhood')) return Home;
  return Shapes;
};

const ZoneList: React.FC<ZoneListProps> = ({ 
  zones, 
  onZoneDeleted, 
  onRefresh 
}) => {
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Zone | null>(null);

  const treeRefreshKey = useMemo(() => `${zones.length}-${zones.map(z => z.id).join(',')}`, [zones]);

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    const zoneId = pendingDelete.id;

    const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
    const auth = authRaw ? JSON.parse(authRaw) : null;
    const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

    try {
      const response = await fetch(`http://localhost:5000/zones/${zoneId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        onZoneDeleted(zoneId);
        toast.success('Zone deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete zone');
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Erreur lors de la suppression de la zone');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
  };

  const handleZoneUpdated = () => {
    setEditingZone(null);
    onRefresh();
  };

  if (zones.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucune zone</h3>
            <p className="text-sm">Commencez par créer votre première zone</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLogoUrl = (logo?: string | null) => {
    if (!logo) return null;
    if (logo.startsWith('http://') || logo.startsWith('https://')) return logo;
    return `http://localhost:5000${logo}`;
  };

  return (
    <div className="space-y-4">
      <ZoneTree refreshKey={treeRefreshKey} />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {zones.length} zone{zones.length > 1 ? 's' : ''} au total
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>GPS</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => {
              const logoUrl = getLogoUrl(zone.logo);
              const TypeIcon = getTypeIcon(zone.zone_type_title);
              return (
                <TableRow key={zone.id}>
                  <TableCell>
                    {logoUrl ? (
                      <img src={logoUrl} alt={zone.title} className="h-8 w-8 rounded object-cover border" />
                    ) : (
                      <div className="h-8 w-8 rounded border flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div className="font-medium">{zone.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{zone.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <TypeIcon className="h-4 w-4 text-gray-500" />
                      {zone.zone_type_title || '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {zone.latitude && zone.longitude ? (
                      <span className="text-sm text-gray-700">{zone.latitude}, {zone.longitude}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(zone)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={(e) => { e.preventDefault(); setPendingDelete(zone); }}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette zone ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La zone sera supprimée définitivement si elle n'est pas utilisée par un projet.
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingZone && (
        <EditZoneModal
          zone={editingZone}
          onClose={() => setEditingZone(null)}
          onZoneUpdated={handleZoneUpdated}
        />
      )}
    </div>
  );
};

export default ZoneList; 