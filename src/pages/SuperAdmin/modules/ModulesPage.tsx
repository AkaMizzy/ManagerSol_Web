import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Layers, Info, List } from 'lucide-react'
import { toast } from 'sonner'

interface ModuleRec { id: string; title: string; description?: string; status?: number | null; logo?: string | null }
interface ModuleFunctionRec { id: string; id_module: string; title: string; description?: string; status?: number | null; logo?: string | null }

const api = 'http://localhost:5000'

export default function ModulesPage() {
	const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
	const auth = authRaw ? JSON.parse(authRaw) : null
	const headers = useMemo(() => auth?.token ? { Authorization: `Bearer ${auth.token}` } as HeadersInit : {}, [auth?.token])

	const [modules, setModules] = useState<ModuleRec[]>([])
	const [loading, setLoading] = useState(true)
	const [creating, setCreating] = useState(false)
	const [editing, setEditing] = useState<ModuleRec | null>(null)
	const [mfModule, setMfModule] = useState<ModuleRec | null>(null)
	const [functions, setFunctions] = useState<ModuleFunctionRec[]>([])
	const [details, setDetails] = useState<ModuleRec | null>(null)
	const [deleting, setDeleting] = useState<ModuleRec | null>(null)

	const loadModules = async () => {
		setLoading(true)
		try {
			const res = await fetch(`${api}/modules`)
			const data = await res.json()
			setModules(data)
		} finally { setLoading(false) }
	}

	const loadFunctions = async (moduleId: string) => {
		setMfModule(modules.find(m => m.id === moduleId) || null)
		const res = await fetch(`${api}/modules/${moduleId}/functions`)
		const data = await res.json()
		setFunctions(data)
	}

	useEffect(() => { loadModules() }, [])

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Gestion des modules</h1>
				<Dialog open={creating} onOpenChange={setCreating}>
					<DialogTrigger asChild>
						<Button className="gap-2"><Plus className="h-4 w-4"/>Nouveau module</Button>
					</DialogTrigger>
					<CreateOrEditModule onDone={() => { setCreating(false); loadModules() }} headers={headers} />
				</Dialog>
			</div>

			{loading ? (
				<div>Chargement...</div>
			) : (
				<div className="rounded-xl border">
					<div className="grid grid-cols-[auto_minmax(0,1fr)_120px_minmax(0,1.5fr)_auto] items-center gap-3 px-4 py-3 border-b bg-secondary/40 text-sm font-medium text-muted-foreground">
						<span>Logo</span>
						<span>Titre</span>
						<span>Statut</span>
						<span>Description</span>
						<span className="text-right">Actions</span>
					</div>
					<div className="divide-y">
						{modules.map(m => (
							<div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_120px_minmax(0,1.5fr)_auto] items-center gap-3 px-4 py-3 hover:bg-accent/5">
								<div className="flex items-center justify-center">
									{m.logo ? (
										<img src={`${api}${m.logo}`} alt="logo" className="h-10 w-10 rounded-md object-cover border" />
									) : (
										<div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center"><Layers className="h-5 w-5 text-accent"/></div>
									)}
								</div>
								<div className="min-w-0 font-medium truncate">{m.title}</div>
								<div><span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent whitespace-nowrap">{String(m.status ?? '—')}</span></div>
								<div className="min-w-0 text-xs text-muted-foreground truncate">{m.description || '—'}</div>
								<div className="flex items-center gap-2 justify-end">
									<Button variant="ghost" size="icon" onClick={() => setDetails(m)} aria-label="Détails"><Info className="h-4 w-4"/></Button>
									<Button variant="outline" size="icon" onClick={() => { setEditing(m) }} aria-label="Modifier"><Edit className="h-4 w-4"/></Button>
									<Button variant="ghost" size="icon" onClick={() => loadFunctions(m.id)} aria-label="Fonctions"><List className="h-4 w-4"/></Button>
									<Button variant="destructive" size="icon" onClick={() => setDeleting(m)} aria-label="Supprimer"><Trash2 className="h-4 w-4"/></Button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{details && (
				<Dialog open={!!details} onOpenChange={(o) => { if (!o) setDetails(null) }}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Détails du module</DialogTitle>
						</DialogHeader>
						<div className="space-y-2 py-2">
							<div className="font-medium">{details.title}</div>
							<div className="text-sm text-muted-foreground">{details.description || '—'}</div>
							<div className="text-sm">Status: {String(details.status ?? '—')}</div>
							{details.logo && <img alt="logo" src={`${api}${details.logo}`} className="h-16" />}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setDetails(null)}>Fermer</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{deleting && (
				<Dialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null) }}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Supprimer le module</DialogTitle>
						</DialogHeader>
						<p>Êtes-vous sûr de vouloir supprimer "{deleting.title}" ? Cette action est irréversible.</p>
						<DialogFooter>
							<Button variant="outline" onClick={() => setDeleting(null)}>Annuler</Button>
							<Button variant="destructive" onClick={async () => { try { const r = await fetch(`${api}/modules/${deleting.id}`, { method: 'DELETE', headers }); if (!r.ok) throw new Error('failed'); toast.success('Module supprimé'); } catch { toast.error('Suppression échouée'); } finally { setDeleting(null); loadModules(); } }}>Supprimer</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{editing && (
				<Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null) }}>
					<EditModule module={editing} headers={headers} onDone={() => { setEditing(null); loadModules() }} />
				</Dialog>
			)}

			{mfModule && (
				<Dialog open={!!mfModule} onOpenChange={(o) => { if (!o) setMfModule(null) }}>
					<ModuleFunctions module={mfModule} headers={headers} />
				</Dialog>
			)}
		</div>
	)
}

function CreateOrEditModule({ onDone, headers }: { onDone: () => void, headers: HeadersInit }) {
	const [form, setForm] = useState({ title: '', description: '', status: '' })
	const [file, setFile] = useState<File | null>(null)
	const [saving, setSaving] = useState(false)
	const submit = async () => {
		if (!form.title.trim()) return
		setSaving(true)
		const fd = new FormData()
		fd.append('title', form.title)
		if (form.description) fd.append('description', form.description)
		if (form.status) fd.append('status', form.status)
		if (file) fd.append('logo', file)
		try {
			const r = await fetch(`${api}/modules`, { method: 'POST', headers, body: fd })
			if (!r.ok) throw new Error('failed')
			toast.success('Module créé')
		} catch {
			toast.error('Création échouée')
		}
		setSaving(false)
		onDone()
	}
	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Créer un module</DialogTitle>
			</DialogHeader>
			<div className="space-y-4 py-2">
				<div className="space-y-2">
					<Label>Titre</Label>
					<Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label>Description</Label>
					<Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label>Status</Label>
					<Input value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label>Logo</Label>
					<input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onClick={onDone}>Annuler</Button>
				<Button onClick={submit} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
			</DialogFooter>
		</DialogContent>
	)
}

function EditModule({ module, onDone, headers }: { module: ModuleRec, onDone: () => void, headers: HeadersInit }) {
	const [form, setForm] = useState({ title: module.title || '', description: module.description || '', status: String(module.status ?? '') })
	const [file, setFile] = useState<File | null>(null)
	const [saving, setSaving] = useState(false)
	const submit = async () => {
		setSaving(true)
		const fd = new FormData()
		if (form.title) fd.append('title', form.title)
		if (form.description) fd.append('description', form.description)
		if (form.status) fd.append('status', form.status)
		if (file) fd.append('logo', file)
		try {
			const r = await fetch(`${api}/modules/${module.id}`, { method: 'PUT', headers, body: fd })
			if (!r.ok) throw new Error('failed')
			toast.success('Module modifié')
		} catch {
			toast.error('Modification échouée')
		}
		setSaving(false)
		onDone()
	}
	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Modifier le module</DialogTitle>
			</DialogHeader>
			<div className="space-y-4 py-2">
				<div className="space-y-2">
					<Label>Titre</Label>
					<Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label>Description</Label>
					<Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label>Status</Label>
					<Input value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label>Logo</Label>
					<input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onClick={onDone}>Annuler</Button>
				<Button onClick={submit} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
			</DialogFooter>
		</DialogContent>
	)
}

function ModuleFunctions({ module, headers }: { module: ModuleRec, headers: HeadersInit }) {
	const [items, setItems] = useState<ModuleFunctionRec[]>([])
	const [creating, setCreating] = useState(false)
	const load = async () => {
		const res = await fetch(`${api}/modules/${module.id}/functions`)
		setItems(await res.json())
	}
	useEffect(() => { load() }, [module.id])
	return (
		<DialogContent className="max-w-3xl">
			<DialogHeader>
				<DialogTitle>Fonctions du module: {module.title}</DialogTitle>
			</DialogHeader>
			<div className="space-y-4 py-2">
				<div className="flex justify-end">
					<Button onClick={() => setCreating(true)} className="gap-2"><Plus className="h-4 w-4"/>Nouvelle fonction</Button>
				</div>
				<div className="divide-y rounded-md border">
					{items.map(fn => (
						<div key={fn.id} className="flex items-center justify-between p-3">
							<div>
								<div className="font-medium">{fn.title}</div>
								<div className="text-xs text-muted-foreground">{fn.description || '—'}</div>
							</div>
							<div className="flex gap-2">
								<EditFunction item={fn} headers={headers} onDone={load} />
								<DeleteFunction id={fn.id} headers={headers} onDone={load} />
							</div>
						</div>
					))}
				</div>
			</div>
			{creating && <CreateFunction moduleId={module.id} headers={headers} onDone={() => { setCreating(false); load() }} />}
		</DialogContent>
	)
}

function CreateFunction({ moduleId, headers, onDone }: { moduleId: string, headers: HeadersInit, onDone: () => void }) {
	const [form, setForm] = useState({ title: '', description: '', status: '' })
	const [file, setFile] = useState<File | null>(null)
	const [saving, setSaving] = useState(false)
	const submit = async () => {
		setSaving(true)
		const fd = new FormData()
		fd.append('title', form.title)
		if (form.description) fd.append('description', form.description)
		if (form.status) fd.append('status', form.status)
		if (file) fd.append('logo', file)
		try {
			const r = await fetch(`${api}/modules/${moduleId}/functions`, { method: 'POST', headers, body: fd })
			if (!r.ok) throw new Error('failed')
			toast.success('Fonction créée')
		} catch {
			toast.error('Création de la fonction échouée')
		}
		setSaving(false)
		onDone()
	}
	return (
		<Dialog open onOpenChange={(o) => { if (!o) onDone() }}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Créer une fonction</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div className="space-y-2">
						<Label>Titre</Label>
						<Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
					</div>
					<div className="space-y-2">
						<Label>Description</Label>
						<Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
					</div>
					<div className="space-y-2">
						<Label>Status</Label>
						<Input value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
					</div>
					<div className="space-y-2">
						<Label>Logo</Label>
						<input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onDone}>Annuler</Button>
					<Button onClick={submit} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function EditFunction({ item, headers, onDone }: { item: ModuleFunctionRec, headers: HeadersInit, onDone: () => void }) {
	const [open, setOpen] = useState(false)
	const [form, setForm] = useState({ title: item.title || '', description: item.description || '', status: String(item.status ?? '') })
	const [file, setFile] = useState<File | null>(null)
	const [saving, setSaving] = useState(false)
	const submit = async () => {
		setSaving(true)
		const fd = new FormData()
		if (form.title) fd.append('title', form.title)
		if (form.description) fd.append('description', form.description)
		if (form.status) fd.append('status', form.status)
		if (file) fd.append('logo', file)
		try {
			const r = await fetch(`${api}/module-functions/${item.id}`, { method: 'PUT', headers, body: fd })
			if (!r.ok) throw new Error('failed')
			toast.success('Fonction modifiée')
		} catch {
			toast.error('Modification de la fonction échouée')
		}
		setSaving(false)
		setOpen(false)
		onDone()
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild><Button variant="outline" size="sm"><Edit className="h-4 w-4"/></Button></DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Modifier la fonction</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div className="space-y-2">
						<Label>Titre</Label>
						<Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
					</div>
					<div className="space-y-2">
						<Label>Description</Label>
						<Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
					</div>
					<div className="space-y-2">
						<Label>Status</Label>
						<Input value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
					</div>
					<div className="space-y-2">
						<Label>Logo</Label>
						<input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
					<Button onClick={submit} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function DeleteFunction({ id, headers, onDone }: { id: string, headers: HeadersInit, onDone: () => void }) {
	const [deleting, setDeleting] = useState(false)
	const remove = async () => {
		setDeleting(true)
		try {
			const r = await fetch(`${api}/module-functions/${id}`, { method: 'DELETE', headers })
			if (!r.ok) throw new Error('failed')
			toast.success('Fonction supprimée')
		} catch {
			toast.error('Suppression échouée')
		}
		setDeleting(false)
		onDone()
	}
	return <Button variant="destructive" size="sm" onClick={remove} disabled={deleting}><Trash2 className="h-4 w-4"/></Button>
} 