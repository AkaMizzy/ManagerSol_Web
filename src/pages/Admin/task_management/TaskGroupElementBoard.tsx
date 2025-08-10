import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskGroupModel = { id: string; title: string; description?: string | null };
type TaskElement = { id: string; title: string; description?: string | null; type?: string };
type TaskGroupElement = {
  id: string;
  sort_order: number;
  column_number: number;
  mandatory: 0 | 1;
  bloc?: number | null;
  title?: string | null;
  description?: string | null;
  task_element_id: string;
  task_group_model_id: string;
  element_title?: string; // from join
  element_type?: string;  // from join
};

export default function TaskGroupElementBoard() {
  const { toast } = useToast();

  // Data
  const [groups, setGroups] = useState<TaskGroupModel[]>([]);
  const [elements, setElements] = useState<TaskElement[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupElements, setGroupElements] = useState<TaskGroupElement[]>([]);

  // UI state
  const [searchGroup, setSearchGroup] = useState("");
  const [searchElement, setSearchElement] = useState("");
  const [droppingElementId, setDroppingElementId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMandatory, setFormMandatory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewItem, setViewItem] = useState<TaskGroupElement | null>(null);

  // Load lists
  useEffect(() => {
    fetch("http://localhost:5000/task-group-models")
      .then((r) => r.json())
      .then((data: TaskGroupModel[]) => setGroups(data))
      .catch(() => setGroups([]));

    fetch("http://localhost:5000/task-elements")
      .then((r) => r.json())
      .then((data: TaskElement[]) => setElements(data))
      .catch(() => setElements([]));
  }, []);

  // Load middle board when group changes
  useEffect(() => {
    if (!activeGroupId) { setGroupElements([]); return; }
    fetch(`http://localhost:5000/task-group-elements?group_id=${encodeURIComponent(activeGroupId)}`)
      .then((r) => r.json())
      .then((rows: TaskGroupElement[]) => setGroupElements(rows))
      .catch(() => setGroupElements([]));
  }, [activeGroupId]);

  const filteredGroups = useMemo(() => {
    const q = searchGroup.toLowerCase();
    return groups.filter(g => g.title.toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q));
  }, [groups, searchGroup]);

  const filteredElements = useMemo(() => {
    const q = searchElement.toLowerCase();
    return elements.filter(e => e.title.toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q));
  }, [elements, searchElement]);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, elementId: string) => {
    e.dataTransfer.setData("text/task-element-id", elementId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDropToCenter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!activeGroupId) return;
    const elId = e.dataTransfer.getData("text/task-element-id");
    if (!elId) return;
    setDroppingElementId(elId);
    const el = elements.find(x => x.id === elId);
    setFormTitle(el?.title || "");
    setFormDescription("");
    setFormMandatory(false);
    setOpenModal(true);
  };
  const onDragOverCenter = (e: React.DragEvent<HTMLDivElement>) => {
    if (activeGroupId) e.preventDefault();
  };

  const startAddByClick = (elementId: string) => {
    if (!activeGroupId) {
      toast({ title: "Select a group", description: "Please select a task group first.", variant: "default" });
      return;
    }
    setDroppingElementId(elementId);
    const el = elements.find((x) => x.id === elementId);
    setFormTitle(el?.title || "");
    setFormDescription("");
    setFormMandatory(false);
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    if (!activeGroupId || !droppingElementId) return;
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/task-group-elements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_group_model_id: activeGroupId,
          task_element_id: droppingElementId,
          title: formTitle || null,
          description: formDescription || null,
          mandatory: formMandatory,
          column_number: 1,
        }),
      });
      if (!res.ok) {
        const errJson: unknown = await res.json().catch(() => ({}));
        let message = "Failed to create mapping";
        if (errJson && typeof errJson === "object" && "error" in errJson) {
          const v = (errJson as Record<string, unknown>).error;
          if (typeof v === "string") message = v;
        }
        throw new Error(message);
      }
      setOpenModal(false);
      // reload board
      const r2 = await fetch(`http://localhost:5000/task-group-elements?group_id=${encodeURIComponent(activeGroupId)}`);
      const rows: TaskGroupElement[] = await r2.json();
      setGroupElements(rows);
      toast({ title: "Added", description: "Task element assigned to the group." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to assign";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Reorder helpers
  const moveItem = (dragId: string, overId: string) => {
    if (dragId === overId) return;
    setGroupElements((prev) => {
      const fromIndex = prev.findIndex((i) => i.id === dragId);
      const toIndex = prev.findIndex((i) => i.id === overId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const commitOrder = async () => {
    if (!activeGroupId) return;
    const validItems = groupElements.filter((it) => Boolean(it.id));
    const skipped = groupElements.length - validItems.length;
    const items = validItems.map((it, idx) => ({
      id: it.id,
      sort_order: idx + 1,
      column_number: it.column_number ?? 1,
    }));
    try {
      const res = await fetch("http://localhost:5000/task-group-elements/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to persist order");
      // Refresh from backend to keep canonical order
      const r2 = await fetch(`http://localhost:5000/task-group-elements?group_id=${encodeURIComponent(activeGroupId)}`);
      const rows: TaskGroupElement[] = await r2.json();
      setGroupElements(rows);
      toast({ title: "Order saved", description: skipped > 0 ? `${skipped} older item(s) skipped.` : undefined });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save order";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const openDetails = (item: TaskGroupElement) => {
    // If currently dragging, ignore clicks
    if (draggingItemId) return;
    setViewItem(item);
    setOpenViewModal(true);
  };

  return (
    <div className="grid gap-4 md:grid-cols-12">
      {/* Left: Groups */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Task Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search groups..." value={searchGroup} onChange={(e) => setSearchGroup(e.target.value)} className="mb-3" />
          <div className="max-h-[70vh] overflow-auto space-y-2">
            {filteredGroups.map((g) => (
              <div
                key={g.id}
                className={cn("rounded-md border p-2 cursor-pointer", activeGroupId === g.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}
                onClick={() => setActiveGroupId((prev) => (prev === g.id ? null : g.id))}
              >
                <div className="text-sm font-medium">{g.title}</div>
                {g.description ? <div className="text-xs text-muted-foreground line-clamp-2">{g.description}</div> : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Center: Board */}
      <Card className="md:col-span-6">
        <CardHeader>
          <CardTitle>Group Elements</CardTitle>
        </CardHeader>
        <CardContent>
          {!activeGroupId ? (
            <div className="text-sm text-muted-foreground">Select a task group to start assigning elements.</div>
          ) : (
            <div
              className="min-h-[60vh] rounded-md border border-dashed border-border p-4 bg-background/50"
              onDragOver={onDragOverCenter}
              onDrop={onDropToCenter}
            >
              {groupElements.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                  Drag task elements here
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {groupElements.map((ge) => (
                    <div
                      key={ge.id}
                      draggable
                      onDragStart={() => setDraggingItemId(ge.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingItemId) moveItem(draggingItemId, ge.id);
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setDraggingItemId(null);
                        await commitOrder();
                      }}
                      onDragEnd={async () => {
                        setDraggingItemId(null);
                      }}
                      className={cn(
                        "rounded-md border p-2 bg-card cursor-grab active:cursor-grabbing",
                        draggingItemId === ge.id && "opacity-70"
                      )}
                      onClick={() => openDetails(ge)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{ge.title || ge.element_title}</div>
                        <div className="flex items-center gap-1">
                          {ge.mandatory ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Mandatory</span> : null}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => openDetails(ge)}>View details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {ge.description ? (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{ge.description}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Elements */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Task Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search elements..." value={searchElement} onChange={(e) => setSearchElement(e.target.value)} className="mb-3" />
          <div className="max-h-[70vh] overflow-auto space-y-2">
            {filteredElements.map((el) => (
              <div
                key={el.id}
                draggable
                onDragStart={(e) => onDragStart(e, el.id)}
                onClick={() => startAddByClick(el.id)}
                className="rounded-md border p-2 bg-card cursor-pointer select-none"
                title="Drag to the middle area or click to add"
              >
                <div className="text-sm font-medium">{el.title}</div>
                {el.description ? <div className="text-xs text-muted-foreground line-clamp-2">{el.description}</div> : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal for extra fields */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Element details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="tge-title">Title</Label>
              <Input id="tge-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Displayed title (optional)" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tge-desc">Description</Label>
              <textarea id="tge-desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded-md border border-input bg-background p-2 text-sm" rows={4} placeholder="Help text or instructions (optional)"/>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="tge-mandatory">Mandatory</Label>
              <Switch id="tge-mandatory" checked={formMandatory} onCheckedChange={(v: boolean) => setFormMandatory(v)} />
              <span className={cn("text-xs", formMandatory ? "text-primary" : "text-muted-foreground")}>{formMandatory ? "Yes" : "No"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !activeGroupId || !droppingElementId}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View details modal */}
      <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Title</span>
                <span className="col-span-2">{viewItem.title || "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Mandatory</span>
                <span className="col-span-2">{viewItem.mandatory ? "Yes" : "No"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Order</span>
                <span className="col-span-2">{viewItem.sort_order}</span>
              </div>
              {viewItem.description ? (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Description</span>
                  <span className="col-span-2 whitespace-pre-wrap">{viewItem.description}</span>
                </div>
              ) : null}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


