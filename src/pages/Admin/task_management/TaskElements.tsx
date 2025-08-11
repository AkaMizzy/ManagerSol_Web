import { useEffect, useMemo, useRef, useState, PropsWithChildren, useCallback } from "react"
import { Plus, Pencil, Trash2, FileText, ListFilter, Info, Hash, Bold, Italic, Underline, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const ALLOWED_TYPES = ['text', 'number', 'file', 'date', 'boolean', 'gps', 'list']
const TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  number: 'Number',
  file: 'Document',
  date: 'Date',
  boolean: 'Yes/No',
  gps: 'GPS coordinates',
  list: 'List',
}
const getTypeLabel = (t?: string) => (t ? (TYPE_LABELS[t] || t) : '')

interface TaskElement {
  id: string
  title: string
  description?: string
  type: string
  mask?: string
  unite_mesure_id?: string | null
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

  // Reflect external value into DOM only when it actually changes
  useEffect(() => {
    if (!editorRef.current) return
    if (value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || ""
      lastValueRef.current = value || ""
    }
  }, [value])

  const keepFocus = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const updateActiveStates = () => {
    // Only update if selection is inside this editor
    const sel = document.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const anchor = sel.anchorNode as Node | null
    if (!anchor || !editorRef.current) return
    if (!editorRef.current.contains(anchor)) return
    try {
      setIsBold(document.queryCommandState('bold'))
      setIsItalic(document.queryCommandState('italic'))
      setIsUnderline(document.queryCommandState('underline'))
    } catch {
      // ignore if not supported
    }
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Bold"
          aria-pressed={isBold}
          className={cn(isBold && "bg-primary/15 text-primary")}
          onMouseDown={keepFocus}
          onClick={() => exec("bold")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Italic"
          aria-pressed={isItalic}
          className={cn(isItalic && "bg-primary/15 text-primary")}
          onMouseDown={keepFocus}
          onClick={() => exec("italic")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Underline"
          aria-pressed={isUnderline}
          className={cn(isUnderline && "bg-primary/15 text-primary")}
          onMouseDown={keepFocus}
          onClick={() => exec("underline")}
        >
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

export default function TaskElements() {
  const { toast } = useToast()
  const [elements, setElements] = useState<TaskElement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const [draft, setDraft] = useState<Partial<TaskElement>>({ title: "", description: "", type: "text", mask: "" })
  const [unites, setUnites] = useState<Array<{ id: string; title: string }>>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<TaskElement | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchElements = useCallback(() => {
    setLoading(true)
    const qs = typeFilter !== 'all' ? `?type=${encodeURIComponent(typeFilter)}` : ''
    fetch(`http://localhost:5000/task-elements${qs}`)
      .then(res => res.json())
      .then((data) => { setElements(data); setLoading(false) })
      .catch(() => { setError('Failed to load task elements'); setLoading(false) })
  }, [typeFilter])

  useEffect(() => { fetchElements() }, [fetchElements])
  useEffect(() => {
    fetch('http://localhost:5000/unite-mesures')
      .then(res => res.json())
      .then((rows: Array<{ id: string | number; title: string }>) => setUnites(rows.map(r => ({ id: String(r.id), title: r.title }))))
      .catch(() => setUnites([]))
  }, [])

  const getUnitTitleById = (id?: string | null): string => {
    if (!id) return ''
    const u = unites.find(x => x.id === String(id))
    return u ? u.title : ''
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return elements.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      getTypeLabel(e.type).toLowerCase().includes(q)
    )
  }, [elements, search])

  const openCreate = () => {
    setDraft({ title: "", description: "", type: "text", mask: "" })
    setCreateOpen(true)
  }

  const openEdit = (el: TaskElement) => {
    setSelectedId(el.id)
    setDraft({ ...el })
    setEditOpen(true)
  }

  const openDelete = (id: string) => {
    setSelectedId(id)
    setDeleteOpen(true)
  }

  const openView = (el: TaskElement) => {
    setViewItem(el)
    setViewOpen(true)
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title || !draft.type) {
      toast({ title: 'Validation', description: 'Title and Type are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = { title: draft.title, description: draft.description, type: draft.type, mask: draft.mask, unite_mesure_id: draft.unite_mesure_id || null }
      const res = await fetch('http://localhost:5000/task-elements', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Create failed')
      toast({ title: 'Created', description: 'Task element has been created' })
      setCreateOpen(false)
      fetchElements()
    } catch {
      toast({ title: 'Error', description: 'Failed to create task element', variant: 'destructive' })
    } finally { setSubmitting(false) }
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setSubmitting(true)
    try {
      const payload = { title: draft.title, description: draft.description, type: draft.type, mask: draft.mask, unite_mesure_id: draft.unite_mesure_id || null }
      const res = await fetch(`http://localhost:5000/task-elements/${selectedId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Update failed')
      toast({ title: 'Updated', description: 'Task element has been updated' })
      setEditOpen(false)
      fetchElements()
    } catch {
      toast({ title: 'Error', description: 'Failed to update task element', variant: 'destructive' })
    } finally { setSubmitting(false) }
  }

  const confirmDelete = async () => {
    if (!selectedId) return
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/task-elements/${selectedId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast({ title: 'Deleted', description: 'Task element has been deleted' })
      setDeleteOpen(false)
      fetchElements()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete task element', variant: 'destructive' })
    } finally { setSubmitting(false) }
  }

  // Quick presets to accelerate form filling
  // (Presets removed to keep UI minimal; can be reintroduced if needed)

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading task elements...</div>
  if (error) return <div className="py-12 text-center text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Elements</h1>
          <p className="text-muted-foreground">Manage task element definitions</p>
        </div>
        <Button className="bg-primary text-primary-foreground" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Task Element
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, type, or description..."
            list="te-suggestions"
          />
          <datalist id="te-suggestions">
            {elements.slice(0, 25).map((el) => (
              <option key={`t-${el.id}`} value={el.title} />
            ))}
            {ALLOWED_TYPES.map((t) => (
              <option key={`ty-${t}`} value={getTypeLabel(t)} />
            ))}
          </datalist>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ALLOWED_TYPES.map(t => (
                <SelectItem key={t} value={t}>{getTypeLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {typeFilter !== 'all' && (
            <Button variant="outline" size="sm" onClick={() => setTypeFilter('all')}>Clear</Button>
          )}
        </div>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>All Task Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit of measure</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((el) => (
                  <TableRow key={el.id}>
                    <TableCell className="font-medium">{el.title}</TableCell>
                    <TableCell className="capitalize">{getTypeLabel(el.type)}</TableCell>
                    <TableCell className="text-muted-foreground">{getUnitTitleById(el.unite_mesure_id) || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openView(el)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(el)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDelete(el.id)}>
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
            <FormSection title="Create a new task element" >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FileText}
                    value={draft.title as string}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Name of the task element"
                    required
                  />
                  
                </div>

                <div className="space-y-1.5">
                  <Label>Type <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <ListFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select value={draft.type as string} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                      <SelectTrigger className="pl-9">
                        <SelectValue placeholder="Choose type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALLOWED_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{getTypeLabel(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                 
                </div>

                <div className="space-y-1.5">
                  <Label>Unit of measure <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Select value={(draft.unite_mesure_id as string) || ''} onValueChange={(v) => setDraft({ ...draft, unite_mesure_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unites.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <RichTextEditor
                    value={(draft.description as string) || ""}
                    onChange={(html) => setDraft({ ...draft, description: html })}
                    placeholder="Explain what this task element is for"
                  />
                </div>
                
              </div>
            </FormSection>

            <FormSection title="Optional rules" desc="Help users with context or restrict the expected format.">
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>Mask <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <InputWithIcon
                    icon={Hash}
                    value={draft.mask as string}
                    onChange={(e) => setDraft({ ...draft, mask: e.target.value })}
                    placeholder="Regex to validate input"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty if no specific format is required.</p>
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
                <Label>Type <span className="text-red-500">*</span></Label>
                <Select value={draft.type as string} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_TYPES.map(t => (<SelectItem key={t} value={t}>{getTypeLabel(t)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <RichTextEditor
                  value={(draft.description as string) || ""}
                  onChange={(html) => setDraft({ ...draft, description: html })}
                  placeholder="Explain what this task element is for"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Unit of measure <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Select value={(draft.unite_mesure_id as string) || ''} onValueChange={(v) => setDraft({ ...draft, unite_mesure_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unites.map(u => (<SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Mask <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input value={draft.mask as string} onChange={(e) => setDraft({ ...draft, mask: e.target.value })} />
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
            <h3 className="text-lg font-semibold text-foreground">Delete task element?</h3>
            <p className="text-muted-foreground">This action cannot be undone.</p>
            <div className="flex items-center gap-3">
              <Button variant="destructive" onClick={confirmDelete} disabled={submitting}>Delete</Button>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          {viewItem && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" /> {viewItem.title}
                </h3>
                <p className="text-sm text-muted-foreground">{getTypeLabel(viewItem.type)}{getUnitTitleById(viewItem.unite_mesure_id) ? ` • ${getUnitTitleById(viewItem.unite_mesure_id)}` : ''}</p>
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
    </div>
  )
}
