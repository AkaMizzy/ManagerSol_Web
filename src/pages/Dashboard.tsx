import { useState } from "react"
import { Plus, Search, Filter, Building2, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyCard, Company } from "@/components/CompanyCard"
import { useNavigate } from "react-router-dom"

// Mock data
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "TechFlow Solutions",
    description: "Leading software development company specializing in web and mobile applications for enterprise clients.",
    industry: "Technology",
    location: "San Francisco, CA",
    foundedYear: 2018,
    employeeCount: 45,
    teamMembers: [
      { id: "1", name: "Sarah Johnson", role: "CEO", email: "sarah@techflow.com" },
      { id: "2", name: "Mike Chen", role: "CTO", email: "mike@techflow.com" },
      { id: "3", name: "Emma Davis", role: "Lead Designer", email: "emma@techflow.com" },
      { id: "4", name: "Alex Rodriguez", role: "Senior Developer", email: "alex@techflow.com" },
    ]
  },
  {
    id: "2",
    name: "GreenEarth Consulting",
    description: "Environmental consulting firm helping businesses reduce their carbon footprint and implement sustainable practices.",
    industry: "Environmental",
    location: "Portland, OR",
    foundedYear: 2020,
    employeeCount: 28,
    teamMembers: [
      { id: "5", name: "Dr. James Wilson", role: "Founder", email: "james@greenearth.com" },
      { id: "6", name: "Lisa Park", role: "Operations Manager", email: "lisa@greenearth.com" },
      { id: "7", name: "Tom Brown", role: "Environmental Analyst", email: "tom@greenearth.com" },
    ]
  },
  {
    id: "3",
    name: "DataVision Analytics",
    description: "Data science and analytics company providing insights and business intelligence solutions for Fortune 500 companies.",
    industry: "Data & Analytics",
    location: "Austin, TX",
    foundedYear: 2019,
    employeeCount: 67,
    teamMembers: [
      { id: "8", name: "Rachel Kim", role: "Data Scientist", email: "rachel@datavision.com" },
      { id: "9", name: "David Thompson", role: "Product Manager", email: "david@datavision.com" },
      { id: "10", name: "Maria Garcia", role: "Business Analyst", email: "maria@datavision.com" },
      { id: "11", name: "John Smith", role: "Engineering Lead", email: "john@datavision.com" },
    ]
  }
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [companies] = useState<Company[]>(mockCompanies)

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalEmployees = companies.reduce((sum, company) => sum + company.employeeCount, 0)
  const avgEmployees = Math.round(totalEmployees / companies.length)

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

      {/* Search and Filter */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies by name, industry, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border focus:ring-primary"
          />
        </div>
        <Button variant="outline" className="border-border">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
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