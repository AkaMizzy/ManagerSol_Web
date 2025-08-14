import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Boxes, Link2, Pencil, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import CreateZoneBlocModal from './CreateZoneBlocModal'
import EditZoneBlocModal from './EditZoneBlocModal'
import ManageBlocZonesModal from './ManageBlocZonesModal'

interface ZoneBloc { id: string; intitule: string }

const ZoneBlocManager: React.FC = () => {
  const [blocs, setBlocs] = useState<ZoneBloc[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editBloc, setEditBloc] = useState<ZoneBloc | null>(null)
  const [manageBlocId, setManageBlocId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ZoneBloc | null>(null)

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  const auth = authRaw ? JSON.parse(authRaw) : null
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/zone-blocs', { headers: { 'Content-Type': 'application/json', ...authHeader } })
      setBlocs(res.ok ? await res.json() : [])
    } catch {
      setBlocs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return
    try {
      const res = await fetch(`http://localhost:5000/zone-blocs/${pendingDelete.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeader } })
      if (!res.ok) throw new Error('fail')
      toast.success('Bloc supprimé')
      setPendingDelete(null)
      load()
    } catch {
      toast.error('Suppression impossible')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Boxes className="h-4 w-4"/> Zone Blocs</CardTitle>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2"/>Créer un bloc</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Chargement...</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bloc</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocs.map(bloc => (
                    <TableRow key={bloc.id}>
                      <TableCell>{bloc.intitule}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setManageBlocId(bloc.id)}><Link2 className="h-4 w-4 mr-2"/>Associer des zones</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditBloc(bloc)}><Pencil className="h-4 w-4 mr-2"/>Modifier</DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600" onSelect={(e) => { e.preventDefault(); setPendingDelete(bloc) }}><Trash2 className="h-4 w-4 mr-2"/>Supprimer</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer ce bloc ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette action est irréversible. Toutes les liaisons zone-bloc seront supprimées.</AlertDialogDescription>
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
          )}
        </CardContent>
      </Card>

      {createOpen && <CreateZoneBlocModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />}
      {editBloc && <EditZoneBlocModal bloc={editBloc} onClose={() => setEditBloc(null)} onUpdated={() => { setEditBloc(null); load() }} />}
      {manageBlocId && <ManageBlocZonesModal blocId={manageBlocId} onClose={() => setManageBlocId(null)} />}
    </div>
  )
}

export default ZoneBlocManager 