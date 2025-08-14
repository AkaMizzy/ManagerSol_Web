import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  onClose: () => void
  onCreated: () => void
}

const CreateZoneBlocModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [intitule, setIntitule] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intitule.trim()) {
      setError('Intitulé requis')
      return
    }
    setLoading(true)
    try {
      const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
      const auth = authRaw ? JSON.parse(authRaw) : null
      const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any)
      const res = await fetch('http://localhost:5000/zone-blocs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ intitule })
      })
      if (!res.ok) throw new Error('Failed to create')
      toast.success('Bloc créé')
      onCreated()
    } catch (e) {
      toast.error('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Créer un bloc
            <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4"/></Button>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Intitulé *</Label>
            <Input value={intitule} onChange={(e) => { setIntitule(e.target.value); setError('') }} placeholder="ex: Bloc A" className={error ? 'border-red-500' : ''} />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateZoneBlocModal 