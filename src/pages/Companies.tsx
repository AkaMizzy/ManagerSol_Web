import { useState } from "react"
import { Plus, Search, Grid, List, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CompanyCard, Company } from "@/components/CompanyCard"
import { useNavigate } from "react-router-dom"

// Mock data - same as Dashboard for consistency
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

export default function Companies() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [companies] = useState<Company[]>(mockCompanies)

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
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}