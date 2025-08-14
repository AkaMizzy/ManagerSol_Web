import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface Zone { id: string; title: string; code: string }

interface Props {
  blocId: string
  onClose: () => void
}

const ManageBlocZonesModal: React.FC<Props> = ({ blocId, onClose }) => {
  const [allZones, setAllZones] = useState<Zone[]>([])
  const [linkedZones, setLinkedZones] = useState<Zone[]>([])
  const [searchLeft, setSearchLeft] = useState('')
  const [searchRight, setSearchRight] = useState('')
  const [loading, setLoading] = useState(true)

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  const auth = authRaw ? JSON.parse(authRaw) : null
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [rz, rl] = await Promise.all([
          fetch('http://localhost:5000/zones'),
          fetch(`http://localhost:5000/zone-blocs/${blocId}/zones`)
        ])
        setAllZones(rz.ok ? await rz.json() : [])
        setLinkedZones(rl.ok ? await rl.json() : [])
      } catch {
        setAllZones([])
        setLinkedZones([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [blocId])

  const availableZones = useMemo(
    () => allZones.filter(z => !linkedZones.find(l => l.id === z.id)),
    [allZones, linkedZones]
  )

  const link = async (zoneId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/zone-blocs/${blocId}/zones/${zoneId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader } })
      if (!res.ok) throw new Error('fail')
      const z = allZones.find(z => z.id === zoneId)
      if (z) setLinkedZones(prev => [...prev, z])
    } catch { toast.error('Erreur lors de l\'ajout') }
  }

  const unlink = async (zoneId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/zone-blocs/${blocId}/zones/${zoneId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeader } })
      if (!res.ok) throw new Error('fail')
      setLinkedZones(prev => prev.filter(z => z.id !== zoneId))
    } catch { toast.error('Erreur lors du retrait') }
  }

  const filteredLeft = availableZones.filter(z => z.title.toLowerCase().includes(searchLeft.toLowerCase()) || z.code.toLowerCase().includes(searchLeft.toLowerCase()))
  const filteredRight = linkedZones.filter(z => z.title.toLowerCase().includes(searchRight.toLowerCase()) || z.code.toLowerCase().includes(searchRight.toLowerCase()))

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Associer des zones</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Chargement...</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Zones disponibles</div>
                <Badge variant="secondary">{availableZones.length}</Badge>
              </div>
              <Input placeholder="Rechercher..." value={searchLeft} onChange={e => setSearchLeft(e.target.value)} className="mb-3" />
              <ScrollArea className="h-72 border rounded-md p-2">
                {filteredLeft.map(z => (
                  <div key={z.id} className="flex items-center justify-between py-2 px-2 hover:bg-muted rounded">
                    <div>
                      <div className="font-medium">{z.title}</div>
                      <div className="text-xs text-muted-foreground">{z.code}</div>
                    </div>
                    <Button size="sm" onClick={() => link(z.id)}>Ajouter</Button>
                  </div>
                ))}
                {filteredLeft.length === 0 && <div className="text-xs text-muted-foreground">Aucune zone</div>}
              </ScrollArea>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Zones liées au bloc</div>
                <Badge variant="secondary">{linkedZones.length}</Badge>
              </div>
              <Input placeholder="Rechercher..." value={searchRight} onChange={e => setSearchRight(e.target.value)} className="mb-3" />
              <ScrollArea className="h-72 border rounded-md p-2">
                {filteredRight.map(z => (
                  <div key={z.id} className="flex items-center justify-between py-2 px-2 hover:bg-muted rounded">
                    <div>
                      <div className="font-medium">{z.title}</div>
                      <div className="text-xs text-muted-foreground">{z.code}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => unlink(z.id)}>Retirer</Button>
                  </div>
                ))}
                {filteredRight.length === 0 && <div className="text-xs text-muted-foreground">Aucune zone liée</div>}
              </ScrollArea>
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

export default ManageBlocZonesModal 