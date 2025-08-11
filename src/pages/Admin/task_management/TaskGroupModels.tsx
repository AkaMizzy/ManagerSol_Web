import { useEffect, useMemo, useRef, useState, PropsWithChildren } from "react"
import { Plus, Pencil, Trash2, FolderTree, FileText, Tag, Info, Bold, Italic, Underline, Eye } from "lucide-react"
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
  domain_id?: string | null
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

function InputWithIcon({ icon: Icon, className, ...props }: React.ComponentProps<'input'> & { icon: React.ComponentType<{ className?: string }> }) {
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

type RichTextEditorProps = { value: string; onChange: (html: string) => void; placeholder?: string }

function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const lastValueRef = useRef<string>("")
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")

  useEffect(() => {
    if (!editorRef.current) return
    if (value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || ""
      lastValueRef.current = value || ""
    }
  }, [value])

  const keepFocus = (e: React.MouseEvent) => { e.preventDefault() }

  const updateActiveStates = () => {
    const sel = document.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const anchor = sel.anchorNode as Node | null
    if (!anchor || !editorRef.current) return
    if (!editorRef.current.contains(anchor)) return
    try {
      setIsBold(document.queryCommandState('bold'))
      setIsItalic(document.queryCommandState('italic'))
      setIsUnderline(document.queryCommandState('underline'))
    } catch { /* ignore unsupported environments */ }
  }

  useEffect(() => {
    const handler = () => updateActiveStates()
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [])

  const exec = (cmd: string) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(cmd, false)
    const html = editorRef.current.innerHTML
    onChange(html)
    lastValueRef.current = html
    updateActiveStates()
  }

  const handleInput = () => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    if (stripHtml(html).trim() === "") {
      onChange("")
      lastValueRef.current = ""
    } else {
      onChange(html)
      lastValueRef.current = html
    }
    updateActiveStates()
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-card p-1">
        <Button type="button" variant="ghost" size="icon" aria-label="Bold" aria-pressed={isBold} className={cn(isBold && "bg-primary/15 text-primary")} onMouseDown={keepFocus} onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Italic" aria-pressed={isItalic} className={cn(isItalic && "bg-primary/15 text-primary")} onMouseDown={keepFocus} onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Underline" aria-pressed={isUnderline} className={cn(isUnderline && "bg-primary/15 text-primary")} onMouseDown={keepFocus} onClick={() => exec("underline")}>
          <Underline className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[100px] w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        onBlur={handleInput}
        data-placeholder={placeholder || "Write a description..."}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
        }
      `}</style>
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
  const [draft, setDraft] = useState<Partial<TaskGroupModel>>({ title: "", domain: "", domain_id: "", description: "" })
  const [domainList, setDomainList] = useState<Array<{ id: string; name: string }>>([])
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState<TaskGroupModel | null>(null)

  const fetchModels = () => {
    setLoading(true)
    fetch("http://localhost:5000/task-group-models")
      .then(res => res.json())
      .then((data: TaskGroupModel[]) => { setModels(data); setLoading(false) })
      .catch(() => { setError("Failed to load task group models"); setLoading(false) })
  }

  useEffect(() => { fetchModels() }, [])

  useEffect(() => {
    // Load available domains for selection
    fetch('http://localhost:5000/domains')
      .then(res => res.json())
      .then((rows: Array<{ id: string | number; title?: string }>) => {
        const mapped = (rows || []).map((r) => ({ id: String(r.id), name: r.title || 'Unnamed' }))
        setDomainList(mapped)
      })
      .catch(() => setDomainList([]))
  }, [])

  const getDomainNameById = (id?: string | null): string => {
    if (!id) return ''
    const found = domainList.find(d => d.id === String(id))
    return found ? found.name : ''
  }

  const domains = useMemo(() => {
    // Prefer domain names from domain list for filtering options; fallback to names present on models
    const names = new Set<string>()
    domainList.forEach(d => names.add(d.name))
    if (names.size === 0) {
      models.forEach(m => { if (m.domain) names.add(m.domain) })
    }
    return Array.from(names).sort()
  }, [models, domainList])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return models.filter(m => {
      const domainName = m.domain || getDomainNameById(m.domain_id)
      const matchesQuery = m.title.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q) || (domainName || "").toLowerCase().includes(q)
      const matchesDomain = domainFilter === "all" || domainName === domainFilter
      return matchesQuery && matchesDomain
    })
  }, [models, search, domainFilter, domainList, getDomainNameById])

  const openCreate = () => { setDraft({ title: "", domain: "", domain_id: domainList[0]?.id || "", description: "" }); setCreateOpen(true) }
  const openEdit = (m: TaskGroupModel) => {
    const domainName = m.domain
    let matchedId: string | undefined = m.domain_id || undefined
    if (!matchedId && domainName) {
      const found = domainList.find(d => d.name === domainName)
      if (found) matchedId = found.id
    }
    setSelectedId(m.id)
    setDraft({ ...m, domain_id: matchedId || '' })
    setEditOpen(true)
  }
  const openDelete = (id: string) => { setSelectedId(id); setDeleteOpen(true) }
  const openView = (m: TaskGroupModel) => { setViewItem(m); setViewOpen(true) }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title) { toast({ title: 'Validation', description: 'Title is required', variant: 'destructive' }); return }
    setSubmitting(true)
    try {
      const payload = { title: draft.title, domain_id: draft.domain_id || null, description: draft.description }
      const res = await fetch('http://localhost:5000/task-group-models', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      const payload = { title: draft.title, domain_id: draft.domain_id || null, description: draft.description }
      const res = await fetch(`http://localhost:5000/task-group-models/${selectedId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2"><FolderTree className="h-4 w-4 text-muted-foreground" />{m.title}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.domain || getDomainNameById(m.domain_id) || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openView(m)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
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
                  <Select value={(draft.domain_id as string) || ''} onValueChange={(v) => setDraft({ ...draft, domain_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domainList.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            <FormSection title="Explain what this group is used for">
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <RichTextEditor
                    value={(draft.description as string) || ""}
                    onChange={(html) => setDraft({ ...draft, description: html })}
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

      {/* View Details */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          {viewItem && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <FolderTree className="h-4 w-4 text-muted-foreground" /> {viewItem.title}
                </h3>
                <p className="text-sm text-muted-foreground">{viewItem.domain || getDomainNameById(viewItem.domain_id) || '—'}</p>
              </div>
              <div className="rounded-lg border p-4 bg-card/40">
                <h4 className="text-sm font-medium mb-2 text-foreground">Description</h4>
                {viewItem.description ? (
                  <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: viewItem.description }} />
                ) : (
                  <p className="text-sm text-muted-foreground">No description.</p>
                )}
              </div>
            </div>
          )}
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
                <Select value={(draft.domain_id as string) || ''} onValueChange={(v) => setDraft({ ...draft, domain_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domainList.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <RichTextEditor
                  value={(draft.description as string) || ""}
                  onChange={(html) => setDraft({ ...draft, description: html })}
                  placeholder="e.g. This group contains all safety checks for the company"
                />
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
