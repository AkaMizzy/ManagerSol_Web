import { useState, useEffect } from "react"
import { Plus, Search, Building2, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyCard, Company } from "@/pages/SuperAdmin/company/CompanyCard"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("http://localhost:5000/companies")
      .then(res => res.json())
      .then((data) => {
        const mapped: Company[] = data.map((c: any) => ({
          id: c.id?.toString() || String(c.id),
          name: c.title || "Untitled Company",
          description: c.description || "",
          industry: c.sector || "",
          location: c.location || "",
          foundedYear: c.foundedYear,
          employeeCount: c.nb_users || 0,
          logo: c.logo ? `http://localhost:5000${c.logo}` : undefined,
          teamMembers: c.teamMembers || [],
        }))
        setCompanies(mapped)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to fetch companies")
        setLoading(false)
      })
  }, [])

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalEmployees = companies.reduce((sum, company) => sum + company.employeeCount, 0)
  const avgEmployees = companies.length > 0 ? Math.round(totalEmployees / companies.length) : 0

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading dashboard...</div>
  }
  if (error) {
    return <div className="py-12 text-center text-destructive">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your companies and teams in one place
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{companies.length}</div>
            <p className="text-xs text-success">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Active organizations
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Across all companies
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Team Size
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Employees per company
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Companies ({filteredCompanies.length})
          </h2>
        </div>
        {filteredCompanies.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg text-muted-foreground mb-2">
                No companies found
              </CardTitle>
              <CardDescription className="text-center mb-4">
                {searchQuery ? "Try adjusting your search criteria" : "Get started by creating your first company"}
              </CardDescription>
              <Button onClick={() => navigate("/create-company")}> 
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}