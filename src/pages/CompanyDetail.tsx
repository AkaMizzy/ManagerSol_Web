import { useState, useEffect } from "react"
import { Building2, Calendar, Users, Globe, Mail, Edit, MoreHorizontal, Save, Phone, CreditCard, Shield, Hash, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Company } from "@/components/CompanyCard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface CompanyDetailProps {
  companyId: string
  onClose: () => void
}

export default function CompanyDetail({ companyId, onClose }: CompanyDetailProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<{
    title: string
    description: string
    email: string
    nb_users: number
    status: string
    foundedYear: number
    sector_phone1?: string
    sector_phone2?: string
    sector_website?: string
    sector_email2?: string
    rc_number?: string
    if_number?: string
    cnss_number?: string
    patente_number?: string
    ice_number?: string
    bank_name?: string
    rib_number?: string
  } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null)
  const [editBankReleveFile, setEditBankReleveFile] = useState<File | null>(null)
  const [extra, setExtra] = useState<{
    email?: string
    status?: string
    nb_users?: number
    foundedYear?: number
    sector_phone1?: string
    sector_phone2?: string
    sector_website?: string
    sector_email2?: string
    rc_number?: string
    if_number?: string
    cnss_number?: string
    patente_number?: string
    ice_number?: string
    bank_name?: string
    rib_number?: string
    bank_releve?: string
  } | null>(null)
  const [editTab, setEditTab] = useState<'info' | 'bank'>('info')

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:5000/companies/${companyId}`)
      .then(res => res.json())
      .then((data) => {
        setCompany({
          id: data.id?.toString() || data.id,
          name: data.title || data.name || "Untitled Company",
          description: data.description || "",
          location: data.location || "",
          foundedYear: data.foundedYear,
          employeeCount: data.nb_users || 0,
          logo: data.logo ? `http://localhost:5000${data.logo}` : undefined,
          teamMembers: []
        })
        setExtra({
          email: data.email,
          status: data.status,
          nb_users: data.nb_users,
          foundedYear: data.foundedYear,
          sector_phone1: data.sector_phone1,
          sector_phone2: data.sector_phone2,
          sector_website: data.sector_website,
          sector_email2: data.sector_email2,
          rc_number: data.rc_number,
          if_number: data.if_number,
          cnss_number: data.cnss_number,
          patente_number: data.patente_number,
          ice_number: data.ice_number,
          bank_name: data.bank_name,
          rib_number: data.rib_number,
          bank_releve: data.bank_releve ? `http://localhost:5000${data.bank_releve}` : undefined,
        })
        setEditForm({
          title: data.title || "",
          description: data.description || "",
          email: data.email || "",
          nb_users: data.nb_users || 1,
          status: data.status || "pending",
          foundedYear: data.foundedYear || new Date().getFullYear(),
          sector_phone1: data.sector_phone1 || "",
          sector_phone2: data.sector_phone2 || "",
          sector_website: data.sector_website || "",
          sector_email2: data.sector_email2 || "",
          rc_number: data.rc_number || "",
          if_number: data.if_number || "",
          cnss_number: data.cnss_number || "",
          patente_number: data.patente_number || "",
          ice_number: data.ice_number || "",
          bank_name: data.bank_name || "",
          rib_number: data.rib_number || "",
        })
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to fetch company details")
        setLoading(false)
      })
  }, [companyId])

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading company details...</div>
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Company Not Found</h1>
        <p className="text-muted-foreground mb-4">The company you're looking for doesn't exist.</p>
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  type EditForm = NonNullable<typeof editForm>
  const handleEditInputChange = (field: keyof EditForm, value: string | number) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }
  const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditLogoFile(e.target.files[0])
    }
  }
  const handleEditBankReleveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditBankReleveFile(e.target.files[0])
    }
  }

  const maskRIB = (rib: string): string => {
    if (!rib) return ''
    const clean = String(rib)
    if (clean.length <= 4) return clean
    return `${clean.slice(0, 4)} •••• •••• ••••`
  }

  const shortId = (value: string): string => {
    if (!value) return ''
    const clean = String(value)
    if (clean.length <= 8) return clean
    return `${clean.slice(0, 4)}…${clean.slice(-4)}`
  }
  const handleEditSubmit = async () => {
    if (!editForm) return
    setIsUpdating(true)
    const data = new FormData()
    data.append("title", editForm.title)
    data.append("description", editForm.description)
    data.append("email", editForm.email)
    data.append("nb_users", String(editForm.nb_users))
    data.append("status", editForm.status)
    data.append("foundedYear", String(editForm.foundedYear))
    // sector updates
    if (editForm.sector_phone1) data.append("sector_phone1", editForm.sector_phone1)
    if (editForm.sector_phone2) data.append("sector_phone2", editForm.sector_phone2)
    if (editForm.sector_website) data.append("sector_website", editForm.sector_website)
    if (editForm.sector_email2) data.append("sector_email2", editForm.sector_email2)
    // banking/admin updates
    if (editForm.rc_number) data.append("rc_number", editForm.rc_number)
    if (editForm.if_number) data.append("if_number", editForm.if_number)
    if (editForm.cnss_number) data.append("cnss_number", editForm.cnss_number)
    if (editForm.patente_number) data.append("patente_number", editForm.patente_number)
    if (editForm.ice_number) data.append("ice_number", editForm.ice_number)
    if (editForm.bank_name) data.append("bank_name", editForm.bank_name)
    if (editForm.rib_number) data.append("rib_number", editForm.rib_number)
    if (editLogoFile) {
      data.append("logo", editLogoFile)
    }
    if (editBankReleveFile) {
      data.append("bank_releve", editBankReleveFile)
    }
    try {
      const res = await fetch(`http://localhost:5000/companies/${companyId}`, {
        method: "PUT",
        body: data,
      })
      if (!res.ok) throw new Error("Failed to update company")
      setEditOpen(false)
      setIsUpdating(false)
      // Optionally refetch company details
      window.location.reload()
    } catch (err) {
      setIsUpdating(false)
      alert("Failed to update company.")
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Company Header */}
      <Card className="border border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                {company?.logo ? (
                  <img src={company.logo} alt={company.name} className="h-16 w-16 object-cover rounded" />
                ) : (
                  <Building2 className="h-10 w-10 text-primary-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-foreground">{company?.name}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {/* location removed from header as per reduced fields */}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company?.foundedYear}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{company?.employeeCount} employees</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-border" onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Company
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-border">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Analytics</DropdownMenuItem>
                  <DropdownMenuItem>Export Data</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete Company</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Two-column layout: Essential Info and Banking Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Essential Info */}
            <Card className="border border-border">
              <CardHeader>
            <CardTitle>Essential Info</CardTitle>
            {company?.description ? (
              <CardDescription className="mt-1">{company.description}</CardDescription>
            ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
            <div className="space-y-3">
              {extra?.email ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <span className="font-medium text-foreground">{extra.email}</span>
                </div>
              ) : null}
              {company?.foundedYear ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Founded</span>
                  </div>
                  <span className="font-medium text-foreground">{company.foundedYear}</span>
                </div>
              ) : null}
              {typeof company?.employeeCount === 'number' ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Number of users</span>
                  </div>
                  <span className="font-medium text-foreground">{company.employeeCount}</span>
                </div>
              ) : null}
              {extra?.sector_phone1 ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <span className="font-medium text-foreground">{extra.sector_phone1}</span>
                </div>
              ) : null}
              {extra?.sector_phone2 ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Second Phone</span>
                  </div>
                  <span className="font-medium text-foreground">{extra.sector_phone2}</span>
                </div>
              ) : null}
              {extra?.sector_website ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                  </div>
                  <a href={extra.sector_website} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                    {extra.sector_website}
                  </a>
                </div>
              ) : null}
              {extra?.sector_email2 ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Secondary Email</span>
                  </div>
                  <span className="font-medium text-foreground">{extra.sector_email2}</span>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Banking Info */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Banking Info</CardTitle>
            <CardDescription>Administrative and financial details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {extra?.bank_name ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Bank</span>
                  </div>
                  <span className="font-medium text-foreground">{extra.bank_name}</span>
                </div>
              ) : null}
              {extra?.rib_number ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>RIB</span>
                  </div>
                  <span className="font-medium text-foreground">{maskRIB(extra.rib_number)}</span>
                </div>
              ) : null}
              {extra?.ice_number ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>ICE</span>
                  </div>
                  <span className="font-medium text-foreground">{shortId(extra.ice_number)}</span>
                </div>
              ) : null}
              {extra?.rc_number ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>RC</span>
                  </div>
                  <span className="font-medium text-foreground">{shortId(extra.rc_number)}</span>
                </div>
              ) : null}
              {extra?.if_number ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>IF</span>
                  </div>
                  <span className="font-medium text-foreground">{shortId(extra.if_number)}</span>
                </div>
              ) : null}
              {extra?.cnss_number ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>CNSS</span>
                  </div>
                  <span className="font-medium text-foreground">{shortId(extra.cnss_number)}</span>
                </div>
              ) : null}
              {extra?.patente_number ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>Patente</span>
                  </div>
                  <span className="font-medium text-foreground">{shortId(extra.patente_number)}</span>
                </div>
              ) : null}
              {extra?.bank_releve ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Bank Statement</span>
                  </div>
                  <a href={extra.bank_releve} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">View</a>
                </div>
              ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
      {/* You can add more tab content for 'team' and 'details' as needed */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[95vw] max-w-5xl md:max-w-6xl min-h-[50vh] max-h-[90vh] overflow-hidden">
          <form className="space-y-6" encType="multipart/form-data">
            <div className="border border-border rounded-lg p-6 bg-card max-h-[78vh] overflow-y-auto">
              <Tabs value={editTab} onValueChange={(v) => setEditTab(v as 'info' | 'bank')}>
                <TabsList className="mb-4">
                  <TabsTrigger value="info">Info & Sector</TabsTrigger>
                  <TabsTrigger value="bank">Banking</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Company Title *</Label>
                      <Input id="title" value={editForm?.title || ""} onChange={(e) => handleEditInputChange("title", e.target.value)} placeholder="Enter company title" className="border-border focus:ring-primary" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                      <Input id="email" type="email" value={editForm?.email || ""} onChange={(e) => handleEditInputChange("email", e.target.value)} placeholder="contact@company.com" className="border-border focus:ring-primary" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={editForm?.description || ""} onChange={(e) => handleEditInputChange("description", e.target.value)} placeholder="Describe what the company does..." className="min-h-[100px] border-border focus:ring-primary" rows={4} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nb_users">Number of Users</Label>
                      <Input id="nb_users" type="number" value={editForm?.nb_users || 1} onChange={(e) => handleEditInputChange("nb_users", parseInt(e.target.value))} className="border-border focus:ring-primary" min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                      <Input id="status" value={editForm?.status || ""} onChange={(e) => handleEditInputChange("status", e.target.value)} className="border-border focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input id="foundedYear" type="number" value={editForm?.foundedYear || new Date().getFullYear()} onChange={(e) => handleEditInputChange("foundedYear", parseInt(e.target.value))} className="border-border focus:ring-primary" min="1800" max={new Date().getFullYear()} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector_phone1">Phone</Label>
                      <Input id="sector_phone1" value={editForm?.sector_phone1 || ''} onChange={(e) => handleEditInputChange('sector_phone1', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector_phone2">Second Phone</Label>
                      <Input id="sector_phone2" value={editForm?.sector_phone2 || ''} onChange={(e) => handleEditInputChange('sector_phone2', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector_website">Website</Label>
                      <Input id="sector_website" type="url" value={editForm?.sector_website || ''} onChange={(e) => handleEditInputChange('sector_website', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector_email2">Secondary Email</Label>
                      <Input id="sector_email2" type="email" value={editForm?.sector_email2 || ''} onChange={(e) => handleEditInputChange('sector_email2', e.target.value)} className="border-border focus:ring-primary" />
                </div>
                <div className="space-y-2">
                      <Label htmlFor="logo">Company Logo</Label>
                      <Input id="logo" type="file" accept="image/*" onChange={handleEditLogoChange} className="border-border focus:ring-primary" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bank" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank</Label>
                      <Input id="bank_name" value={editForm?.bank_name || ''} onChange={(e) => handleEditInputChange('bank_name', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rib_number">RIB</Label>
                      <Input id="rib_number" value={editForm?.rib_number || ''} onChange={(e) => handleEditInputChange('rib_number', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rc_number">RC</Label>
                      <Input id="rc_number" value={editForm?.rc_number || ''} onChange={(e) => handleEditInputChange('rc_number', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="if_number">IF</Label>
                      <Input id="if_number" value={editForm?.if_number || ''} onChange={(e) => handleEditInputChange('if_number', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnss_number">CNSS</Label>
                      <Input id="cnss_number" value={editForm?.cnss_number || ''} onChange={(e) => handleEditInputChange('cnss_number', e.target.value)} className="border-border focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patente_number">Patente</Label>
                      <Input id="patente_number" value={editForm?.patente_number || ''} onChange={(e) => handleEditInputChange('patente_number', e.target.value)} className="border-border focus:ring-primary" />
                </div>
                    <div className="space-y-2">
                      <Label htmlFor="ice_number">ICE</Label>
                      <Input id="ice_number" value={editForm?.ice_number || ''} onChange={(e) => handleEditInputChange('ice_number', e.target.value)} className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                      <Label htmlFor="bank_releve">Bank Statement (Relevé)</Label>
                      <Input id="bank_releve" type="file" accept="image/*,application/pdf" onChange={(e) => handleEditBankReleveChange(e)} className="border-border focus:ring-primary" />
                    </div>
              </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                disabled={isUpdating}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
                onClick={handleEditSubmit}
              >
                {isUpdating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={isUpdating}>Close</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}