import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  bloc: { id: string; intitule: string }
  onClose: () => void
  onUpdated: () => void
}

const EditZoneBlocModal: React.FC<Props> = ({ bloc, onClose, onUpdated }) => {
  const [intitule, setIntitule] = useState(bloc.intitule)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intitule.trim()) return
    setLoading(true)
    try {
      const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
      const auth = authRaw ? JSON.parse(authRaw) : null
      const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any)
      const res = await fetch(`http://localhost:5000/zone-blocs/${bloc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ intitule })
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Bloc modifié')
      onUpdated()
    } catch (e) {
      toast.error('Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Modifier le bloc
            <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4"/></Button>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Intitulé *</Label>
            <Input value={intitule} onChange={(e) => setIntitule(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditZoneBlocModal 