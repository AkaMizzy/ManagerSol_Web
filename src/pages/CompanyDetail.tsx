import { useState, useEffect } from "react"
import { Building2, MapPin, Calendar, Users, Globe, Mail, Edit, MoreHorizontal, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Company } from "@/components/CompanyCard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CompanyDetailProps {
  companyId: string
  onClose: () => void
}

export default function CompanyDetail({ companyId, onClose }: CompanyDetailProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<"overview" | "team" | "details">("overview")
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:5000/companies/${companyId}`)
      .then(res => res.json())
      .then((data) => {
        setCompany({
          id: data.id?.toString() || data.id,
          name: data.title || data.name || "Untitled Company",
          description: data.description || "",
          industry: data.sector || "",
          location: data.location || "",
          foundedYear: data.foundedYear,
          employeeCount: data.nb_users || 0,
          logo: data.logo ? `http://localhost:5000${data.logo}` : undefined,
          teamMembers: []
        })
        setEditForm({
          title: data.title || "",
          description: data.description || "",
          email: data.email || "",
          nb_users: data.nb_users || 1,
          status: data.status || "pending",
          foundedYear: data.foundedYear,
          sector: data.sector || "Technology"
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

  const handleEditInputChange = (field: string, value: string | number) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }))
  }
  const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditLogoFile(e.target.files[0])
    }
  }
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    const data = new FormData()
    data.append("title", editForm.title)
    data.append("description", editForm.description)
    data.append("email", editForm.email)
    data.append("nb_users", String(editForm.nb_users))
    data.append("status", editForm.status)
    data.append("foundedYear", String(editForm.foundedYear))
    data.append("sector", editForm.sector)
    if (editLogoFile) {
      data.append("logo", editLogoFile)
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
                  <Badge variant="secondary" className="text-sm">
                    {company?.industry}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company?.location}</span>
                  </div>
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
      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-border">
        {[
          { id: "overview", label: "Overview" },
          { id: "team", label: "Team" },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`rounded-none border-b-2 ${
              selectedTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="col-span-2 space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium text-foreground">{company.industry}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Founded</span>
                  <span className="font-medium text-foreground">{company.foundedYear}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees</span>
                  <span className="font-medium text-foreground">{company.employeeCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground">{company.location}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* You can add more tab content for 'team' and 'details' as needed */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleEditSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Company Title *</Label>
                  <Input
                    id="title"
                    value={editForm?.title || ""}
                    onChange={(e) => handleEditInputChange("title", e.target.value)}
                    placeholder="Enter company title"
                    className="border-border focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm?.email || ""}
                    onChange={(e) => handleEditInputChange("email", e.target.value)}
                    placeholder="contact@company.com"
                    className="border-border focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm?.description || ""}
                  onChange={(e) => handleEditInputChange("description", e.target.value)}
                  placeholder="Describe what the company does..."
                  className="min-h-[100px] border-border focus:ring-primary"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nb_users">Number of Users</Label>
                  <Input
                    id="nb_users"
                    type="number"
                    value={editForm?.nb_users || 1}
                    onChange={(e) => handleEditInputChange("nb_users", parseInt(e.target.value))}
                    className="border-border focus:ring-primary"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={editForm?.status || ""}
                    onChange={(e) => handleEditInputChange("status", e.target.value)}
                    className="border-border focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={editForm?.foundedYear || new Date().getFullYear()}
                    onChange={(e) => handleEditInputChange("foundedYear", parseInt(e.target.value))}
                    className="border-border focus:ring-primary"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <div className="flex flex-wrap gap-4">
                    {["Technology", "Healthcare", "Finance", "Education"].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sector"
                          value={option}
                          checked={editForm?.sector === option}
                          onChange={() => handleEditInputChange("sector", option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleEditLogoChange}
                  className="border-border focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                {isUpdating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Company
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={isUpdating}
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}