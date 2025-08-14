import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Link2, MapPin, Boxes } from 'lucide-react'
import { toast } from 'sonner'

interface Assignment {
  id: string
  id_zone?: string | null
  id_bloc?: string | null
  zone_title?: string | null
  bloc_title?: string | null
}

interface Zone { id: string; title: string; code: string }
interface Bloc { id: string; intitule: string }

interface Props {
  userId: string
  onClose: () => void
}

const ManageUserAssignmentsModal: React.FC<Props> = ({ userId, onClose }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [blocs, setBlocs] = useState<Bloc[]>([])
  const [mode, setMode] = useState<'zone' | 'bloc'>('zone')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  const auth = authRaw ? JSON.parse(authRaw) : null
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any)

  const load = async () => {
    try {
      setLoading(true)
      const [ra, rz, rb] = await Promise.all([
        fetch(`http://localhost:5000/users/${userId}/assignments`, { headers: { 'Content-Type': 'application/json', ...authHeader } }),
        fetch('http://localhost:5000/zones', { headers: { 'Content-Type': 'application/json', ...authHeader } }),
        fetch('http://localhost:5000/zone-blocs', { headers: { 'Content-Type': 'application/json', ...authHeader } })
      ])
      setAssignments(ra.ok ? await ra.json() : [])
      setZones(rz.ok ? await rz.json() : [])
      setBlocs(rb.ok ? await rb.json() : [])
    } catch {
      setAssignments([])
      setZones([])
      setBlocs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredZones = useMemo(() => zones.filter(z => z.title.toLowerCase().includes(query.toLowerCase()) || z.code?.toLowerCase().includes(query.toLowerCase())), [zones, query])
  const filteredBlocs = useMemo(() => blocs.filter(b => b.intitule.toLowerCase().includes(query.toLowerCase())), [blocs, query])

  const addAssignment = async () => {
    if (!selectedId) return
    try {
      const body = mode === 'zone' ? { id_zone: selectedId } : { id_bloc: selectedId }
      const res = await fetch(`http://localhost:5000/users/${userId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('fail')
      toast.success('Affectation enregistrée')
      setSelectedId('')
      load()
    } catch {
      toast.error('Erreur lors de l\'affectation')
    }
  }

  const removeAssignment = async (assignmentId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader }
      })
      if (!res.ok) throw new Error('fail')
      toast.success('Affectation retirée')
      setAssignments(prev => prev.filter(a => a.id !== assignmentId))
    } catch {
      toast.error('Erreur lors du retrait')
    }
  }

  const listToShow = mode === 'zone' ? filteredZones : filteredBlocs

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="h-4 w-4"/> Affectations utilisateur</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Chargement...</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button variant={mode === 'zone' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('zone'); setQuery(''); setSelectedId('') }}><MapPin className="h-3 w-3 mr-1"/> Zone</Button>
                  <Button variant={mode === 'bloc' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('bloc'); setQuery(''); setSelectedId('') }}><Boxes className="h-3 w-3 mr-1"/> Bloc</Button>
                </div>
              </div>
              <Input placeholder={mode === 'zone' ? 'Rechercher une zone...' : 'Rechercher un bloc...'} value={query} onChange={e => setQuery(e.target.value)} />
              <div className="border rounded-md divide-y max-h-72 overflow-auto">
                {listToShow.map((item: any) => (
                  <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full text-left px-3 py-2 hover:bg-muted ${selectedId === item.id ? 'bg-muted' : ''}`}>
                    <div className="font-medium">{mode === 'zone' ? item.title : item.intitule}</div>
                    <div className="text-xs text-muted-foreground">{mode === 'zone' ? item.code : ''}</div>
                  </button>
                ))}
                {listToShow.length === 0 && <div className="px-3 py-6 text-sm text-muted-foreground">Aucun résultat</div>}
              </div>
              <div className="flex justify-end">
                <Button onClick={addAssignment} disabled={!selectedId}>Ajouter</Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Affectations actuelles</div>
                <Badge variant="secondary">{assignments.length}</Badge>
              </div>
              <div className="border rounded-md divide-y max-h-96 overflow-auto">
                {assignments.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <div className="font-medium">{a.zone_title || a.bloc_title}</div>
                      <div className="text-xs text-muted-foreground">{a.id_zone ? 'Zone' : 'Bloc'}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeAssignment(a.id)}><Trash2 className="h-3 w-3 mr-1"/>Retirer</Button>
                  </div>
                ))}
                {assignments.length === 0 && <div className="px-3 py-6 text-sm text-muted-foreground">Aucune affectation</div>}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ManageUserAssignmentsModal 