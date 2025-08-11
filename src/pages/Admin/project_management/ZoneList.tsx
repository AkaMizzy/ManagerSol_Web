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
import { Edit, Trash2, MoreHorizontal, MapPin, Image as ImageIcon } from 'lucide-react';
import EditZoneModal from './EditZoneModal';

interface Zone {
  id: string;
  title: string;
  code: string;
  latitude?: string | null;
  longitude?: string | null;
  logo?: string | null;
}

interface ZoneListProps {
  zones: Zone[];
  onZoneDeleted: (zoneId: string) => void;
  onRefresh: () => void;
}

const ZoneList: React.FC<ZoneListProps> = ({ 
  zones, 
  onZoneDeleted, 
  onRefresh 
}) => {
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const handleDelete = async (zoneId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/zones/${zoneId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onZoneDeleted(zoneId);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Erreur lors de la suppression de la zone');
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
              <TableHead>GPS</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => {
              const logoUrl = getLogoUrl(zone.logo);
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
                        <DropdownMenuItem 
                          onClick={() => handleDelete(zone.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
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