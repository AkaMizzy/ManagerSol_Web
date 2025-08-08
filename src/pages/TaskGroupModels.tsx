import { useEffect, useMemo, useState, PropsWithChildren } from "react"
import { Plus, Pencil, Trash2, FolderTree, FileText, Tag, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface TaskGroupModel {
  id: string
  title: string
  domain?: string | null
  description?: string | null
}

function FormSection({ title, desc, children, className }: PropsWithChildren<{ title: string; desc?: string; className?: string }>) {
  return (
    <div className={cn("rounded-xl border border-border bg-card/40 p-4 md:p-5", className)}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {desc ? <p className="text-xs text-muted-foreground mt-0.5">{desc}</p> : null}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  )
}

function InputWithIcon({ icon: Icon, className, ...props }: React.ComponentProps<'input'> & { icon: React.ComponentType<any> }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        {...props}
        className={cn(
          "pl-9 pr-3 h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          className
        )}
      />
    </div>
  )
}

export default function TaskGroupModels() {
  const { toast } = useToast()

  const [models, setModels] = useState<TaskGroupModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [domainFilter, setDomainFilter] = useState<string>("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState<Partial<TaskGroupModel>>({ title: "", domain: "", description: "" })

  const fetchModels = () => {
    setLoading(true)
    fetch("http://localhost:5000/task-group-models")
      .then(res => res.json())
      .then((data: TaskGroupModel[]) => { setModels(data); setLoading(false) })
      .catch(() => { setError("Failed to load task group models"); setLoading(false) })
  }

  useEffect(() => { fetchModels() }, [])

  const domains = useMemo(() => {
    const set = new Set<string>()
    models.forEach(m => { if (m.domain) set.add(m.domain) })
    return Array.from(set).sort()
  }, [models])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return models.filter(m => {
      const matchesQuery = m.title.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q) || (m.domain || "").toLowerCase().includes(q)
      const matchesDomain = domainFilter === "all" || (m.domain || "") === domainFilter
      return matchesQuery && matchesDomain
    })
  }, [models, search, domainFilter])

  const openCreate = () => { setDraft({ title: "", domain: "", description: "" }); setCreateOpen(true) }
  const openEdit = (m: TaskGroupModel) => { setSelectedId(m.id); setDraft({ ...m }); setEditOpen(true) }
  const openDelete = (id: string) => { setSelectedId(id); setDeleteOpen(true) }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title) { toast({ title: 'Validation', description: 'Title is required', variant: 'destructive' }); return }
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5000/task-group-models', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      })
      if (!res.ok) throw new Error('Create failed')
      toast({ title: 'Created', description: 'Task group model created' })
      setCreateOpen(false)
      fetchModels()
    } catch {
      toast({ title: 'Error', description: 'Failed to create task group model', variant: 'destructive' })
    } finally { setSubmitting(false) }
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/task-group-models/${selectedId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      })
      if (!res.ok) throw new Error('Update failed')
      toast({ title: 'Updated', description: 'Task group model updated' })
      setEditOpen(false)
      fetchModels()
    } catch {
      toast({ title: 'Error', description: 'Failed to update task group model', variant: 'destructive' })
    } finally { setSubmitting(false) }
  }

  const confirmDelete = async () => {
    if (!selectedId) return
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/task-group-models/${selectedId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast({ title: 'Deleted', description: 'Task group model deleted' })
      setDeleteOpen(false)
      fetchModels()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete task group model', variant: 'destructive' })
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading task group models...</div>
  if (error) return <div className="py-12 text-center text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Group Models</h1>
          <p className="text-muted-foreground">Organize related task elements into reusable groups</p>
        </div>
        <Button className="bg-primary text-primary-foreground" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Group
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups by title, domain, or description..."
            list="tgm-suggestions"
          />
          <datalist id="tgm-suggestions">
            {models.slice(0, 25).map((m) => (
              <option key={`t-${m.id}`} value={m.title} />
            ))}
            {domains.slice(0, 25).map((d) => (
              <option key={`d-${d}`} value={d} />
            ))}
          </datalist>
        </div>
        <div className="flex items-center gap-2">
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {domains.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {domainFilter !== 'all' && (
            <Button variant="outline" size="sm" onClick={() => setDomainFilter('all')}>Clear</Button>
          )}
        </div>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>All Task Group Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2"><FolderTree className="h-4 w-4 text-muted-foreground" />{m.title}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.domain || '-'}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[420px] truncate">{m.description || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDelete(m.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={submitCreate} className="space-y-5">
            <FormSection title="Create a new task group model">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FileText}
                    value={draft.title as string}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Safety Checks"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Domain <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <InputWithIcon
                    icon={Tag}
                    value={draft.domain as string}
                    onChange={(e) => setDraft({ ...draft, domain: e.target.value })}
                    placeholder="e.g. Safety, HR, Finance"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Explain what this group is used for">
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <InputWithIcon
                    icon={Info}
                    value={draft.description as string}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="e.g. This group contains all safety checks for the company"
                  />
                </div>
              </div>
            </FormSection>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground transition-all active:scale-[0.99]">
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={submitEdit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input value={draft.title as string} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Domain <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input value={draft.domain as string} onChange={(e) => setDraft({ ...draft, domain: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input value={draft.description as string} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">{submitting ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Delete task group model?</h3>
            <p className="text-muted-foreground">This action cannot be undone.</p>
            <div className="flex items-center gap-3">
              <Button variant="destructive" onClick={confirmDelete} disabled={submitting}>Delete</Button>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
