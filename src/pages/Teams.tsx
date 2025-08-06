import { useState } from "react"
import { Search, Users, Building2, Mail, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Company, TeamMember } from "@/components/CompanyCard"

// Mock data - same as other pages for consistency
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
      { id: "1", name: "Sarah Johnson", role: "CEO & Founder", email: "sarah@techflow.com" },
      { id: "2", name: "Mike Chen", role: "CTO", email: "mike@techflow.com" },
      { id: "3", name: "Emma Davis", role: "Lead Designer", email: "emma@techflow.com" },
      { id: "4", name: "Alex Rodriguez", role: "Senior Developer", email: "alex@techflow.com" },
      { id: "5", name: "Jennifer Liu", role: "Product Manager", email: "jennifer@techflow.com" },
      { id: "6", name: "David Park", role: "DevOps Engineer", email: "david@techflow.com" },
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
      { id: "5", name: "Dr. James Wilson", role: "Founder & Environmental Scientist", email: "james@greenearth.com" },
      { id: "6", name: "Lisa Park", role: "Operations Manager", email: "lisa@greenearth.com" },
      { id: "7", name: "Tom Brown", role: "Environmental Analyst", email: "tom@greenearth.com" },
      { id: "8", name: "Maria Rodriguez", role: "Sustainability Consultant", email: "maria@greenearth.com" },
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
      { id: "8", name: "Rachel Kim", role: "Lead Data Scientist", email: "rachel@datavision.com" },
      { id: "9", name: "David Thompson", role: "Product Manager", email: "david@datavision.com" },
      { id: "10", name: "Maria Garcia", role: "Business Analyst", email: "maria@datavision.com" },
      { id: "11", name: "John Smith", role: "Engineering Lead", email: "john@datavision.com" },
      { id: "12", name: "Sofia Chen", role: "Data Engineer", email: "sofia@datavision.com" },
    ]
  }
]

// Flatten all team members with company info
const allTeamMembers = mockCompanies.flatMap(company => 
  company.teamMembers.map(member => ({
    ...member,
    companyId: company.id,
    companyName: company.name,
    companyIndustry: company.industry
  }))
)

export default function Teams() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")

  const filteredMembers = allTeamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCompany = selectedCompany === "all" || member.companyId === selectedCompany
    
    return matchesSearch && matchesCompany
  })

  const totalMembers = allTeamMembers.length
  const companiesWithTeams = mockCompanies.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teams</h1>
          <p className="text-muted-foreground">
            View and manage team members across all companies
          </p>
        </div>
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
              With active teams
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
              {Math.round(totalMembers / companiesWithTeams)}
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
            {mockCompanies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
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
                        <AvatarImage src={member.avatar} alt={member.name} />
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
                        <DropdownMenuItem>Edit Profile</DropdownMenuItem>
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
    </div>
  )
}