import { useState, useEffect } from "react"
import { Search, Users, Building2, Mail, MoreHorizontal, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface BackendUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  email_second?: string;
  identifier?: string;
  phone1?: string;
  phone2?: string;
  status?: string;
  role?: string;
  company_id: string;
  password?: string;
}
interface BackendCompany {
  id: string;
  title: string;
  sector?: string;
  email?: string;
}
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  companyId: string;
  companyName: string;
  companyIndustry: string;
}

export default function User() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [users, setUsers] = useState<BackendUser[]>([])
  const [companies, setCompanies] = useState<BackendCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    email_second: "",
    identifier: "",
    phone1: "",
    phone2: "",
    status: "",
    role: "user",
    company_id: "",
    password: ""
  })
  const [isCreating, setIsCreating] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<BackendUser | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("http://localhost:5000/users").then(res => res.json()),
      fetch("http://localhost:5000/companies").then(res => res.json()),
    ])
      .then(([usersData, companiesData]) => {
        setUsers(usersData)
        setCompanies(companiesData)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to fetch users or companies")
        setLoading(false)
      })
  }, [])

  // Auto-fill email when company is selected
  useEffect(() => {
    if (newUser.company_id) {
      const company = companies.find(c => c.id === newUser.company_id)
      if (company) {
        setNewUser(prev => ({ ...prev, email: company.email || "" }))
      }
    }
  }, [newUser.company_id, companies])

  const allTeamMembers: TeamMember[] = users.map(user => {
    const company = companies.find(c => c.id === user.company_id)
    return {
      id: user.id,
      name: user.firstname + " " + user.lastname,
      role: user.role || "",
      email: user.email,
      companyId: user.company_id,
      companyName: company ? company.title : "Unknown",
      companyIndustry: company ? company.sector || "" : "",
    }
  })

  const filteredMembers = allTeamMembers.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCompany = selectedCompany === "all" || member.companyId === selectedCompany
    return matchesSearch && matchesCompany
  })

  const totalMembers = allTeamMembers.length
  const companiesWithTeams = companies.length

  const handleNewUserChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })
      if (!res.ok) throw new Error("Failed to create user")
      setCreateOpen(false)
      setIsCreating(false)
      window.location.reload()
    } catch (err) {
      setIsCreating(false)
      alert("Failed to create user.")
    }
  }

  const handleEditUserChange = (field: string, value: string) => {
    setEditUser((prev: any) => ({ ...prev, [field]: value }))
  }

  const openEditModal = (user: BackendUser) => {
    setEditUser({ ...user })
    setEditOpen(true)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(true)
    try {
      const res = await fetch(`http://localhost:5000/users/${editUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser)
      })
      if (!res.ok) throw new Error("Failed to update user")
      setEditOpen(false)
      setIsEditing(false)
      window.location.reload()
    } catch (err) {
      setIsEditing(false)
      alert("Failed to update user.")
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading Users...</div>
  }
  if (error) {
    return <div className="py-12 text-center text-destructive">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">
            View and manage Users members across all companies
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground" onClick={() => setCreateOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
          Create New User
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all companies
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{companiesWithTeams}</div>
            <p className="text-xs text-muted-foreground">
              With active Users
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Team Size
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {companiesWithTeams > 0 ? Math.round(totalMembers / companiesWithTeams) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Members per company
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search team members by name, role, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border focus:ring-primary"
          />
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[200px] border-border">
            <SelectValue placeholder="Filter by company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredMembers.length} of {totalMembers} team members
          </p>
        </div>
        {filteredMembers.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg text-muted-foreground mb-2">
                No team members found
              </CardTitle>
              <CardDescription className="text-center">
                Try adjusting your search criteria or filters
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={`${member.companyId}-${member.id}`} className="border border-border hover:bg-card-hover transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(users.find(u => u.id === member.id))}>Edit Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Company</span>
                      <Badge variant="secondary" className="text-xs">
                        {member.companyName}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Industry</span>
                      <span className="text-sm text-foreground">{member.companyIndustry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <a 
                        href={`mailto:${member.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {member.email.length > 20 ? `${member.email.substring(0, 20)}...` : member.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 border-border">
                      <Mail className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-border">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstname"
                    value={newUser.firstname}
                    onChange={e => handleNewUserChange("firstname", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastname"
                    value={newUser.lastname}
                    onChange={e => handleNewUserChange("lastname", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">Company <span className="text-red-500">*</span></Label>
                <Select value={newUser.company_id} onValueChange={val => handleNewUserChange("company_id", val)}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    value={newUser.email}
                    readOnly
                    className="bg-muted"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_second">Secondary Email <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="email_second"
                    value={newUser.email_second}
                    onChange={e => handleNewUserChange("email_second", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone1">Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone1"
                    value={newUser.phone1}
                    onChange={e => handleNewUserChange("phone1", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone2">Secondary Phone <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="phone2"
                    value={newUser.phone2}
                    onChange={e => handleNewUserChange("phone2", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Identifier <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="identifier"
                    value={newUser.identifier}
                    onChange={e => handleNewUserChange("identifier", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={e => handleNewUserChange("password", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                  <Select value={newUser.role} onValueChange={val => handleNewUserChange("role", val)}>
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superAdmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="status"
                    value={newUser.status}
                    onChange={e => handleNewUserChange("status", e.target.value)}
                  />
                </div>
              </div>
              
            </div>
            <div className="flex items-center space-x-4">
              <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary-hover text-primary-foreground">
                {isCreating ? "Creating..." : "Create User"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isCreating} className="border-border">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleEditUser} className="space-y-6">
            <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstname"
                    value={editUser?.firstname}
                    onChange={e => handleEditUserChange("firstname", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastname"
                    value={editUser?.lastname}
                    onChange={e => handleEditUserChange("lastname", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">Company <span className="text-red-500">*</span></Label>
                <Select value={editUser?.company_id} onValueChange={val => handleEditUserChange("company_id", val)}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    value={editUser?.email}
                    readOnly
                    className="bg-muted"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_second">Secondary Email <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="email_second"
                    value={editUser?.email_second}
                    onChange={e => handleEditUserChange("email_second", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone1">Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone1"
                    value={editUser?.phone1}
                    onChange={e => handleEditUserChange("phone1", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone2">Secondary Phone <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="phone2"
                    value={editUser?.phone2}
                    onChange={e => handleEditUserChange("phone2", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Identifier <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="identifier"
                    value={editUser?.identifier}
                    onChange={e => handleEditUserChange("identifier", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="password"
                    type="password"
                    value={editUser?.password}
                    onChange={e => handleEditUserChange("password", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                  <Select value={editUser?.role} onValueChange={val => handleEditUserChange("role", val)}>
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superAdmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="status"
                    value={editUser?.status}
                    onChange={e => handleEditUserChange("status", e.target.value)}
                  />
                </div>
              </div>
              
            </div>
            <div className="flex items-center space-x-4">
              <Button type="submit" disabled={isEditing} className="bg-primary hover:bg-primary-hover text-primary-foreground">
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={isEditing} className="border-border">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}