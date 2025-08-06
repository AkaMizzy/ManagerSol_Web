import { useState, useEffect } from "react"
import { Plus, Search, Grid, List, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CompanyCard, Company } from "@/components/CompanyCard"
import { useNavigate } from "react-router-dom"
import CompanyDetail from "./CompanyDetail"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface BackendCompany {
  id: number | string;
  title: string;
  description?: string;
  logo?: string;
  email?: string;
  nb_users?: number;
  status?: string;
}

export default function Companies() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("http://localhost:5000/companies")
      .then(res => res.json())
      .then((data: BackendCompany[]) => {
        const mapped = data.map((c) => ({
          id: c.id?.toString() || c.id,
          name: c.title || c.name || "Untitled Company",
          description: c.description || "",
          industry: "N/A",
          location: "N/A",
          foundedYear: 2020,
          employeeCount: c.nb_users || 0,
          logo: c.logo ? `http://localhost:5000${c.logo}` : undefined,
          teamMembers: [],
        }))
        setCompanies(mapped)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch companies")
        setLoading(false)
      })
  }, [])

  const filteredAndSortedCompanies = companies
    .filter(company =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "employees":
          return b.employeeCount - a.employeeCount
        case "founded":
          return b.foundedYear - a.foundedYear
        case "industry":
          return a.industry.localeCompare(b.industry)
        default:
          return 0
      }
    })

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading companies...</div>
  }

  if (error) {
    return <div className="py-12 text-center text-destructive">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground">
            View and manage all your companies
          </p>
        </div>
        <Button 
          onClick={() => navigate("/create-company")}
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border focus:ring-primary"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] border-border">
            <SortAsc className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="employees">Employee Count</SelectItem>
            <SelectItem value="founded">Founded Year</SelectItem>
            <SelectItem value="industry">Industry</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border border-border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="border-0 rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="border-0 rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredAndSortedCompanies.length} of {companies.length} companies
          </p>
        </div>
        {filteredAndSortedCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or add a new company.
            </p>
            <Button onClick={() => navigate("/create-company")}> 
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
          }>
            {filteredAndSortedCompanies.map((company) => (
              <div key={company.id} onClick={() => { setSelectedCompanyId(company.id); setIsDetailOpen(true); }} style={{ cursor: 'pointer' }}>
                <CompanyCard company={company} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCompanyId && (
            <CompanyDetail companyId={selectedCompanyId} onClose={() => setIsDetailOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}