import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, MapPin, Calendar, Users, Globe, Mail, Edit, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Company, TeamMember } from "@/components/CompanyCard"

// Mock data - same as other pages for consistency
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "TechFlow Solutions",
    description: "Leading software development company specializing in web and mobile applications for enterprise clients. We focus on creating scalable, user-friendly solutions that drive business growth and innovation.",
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
    ]
  }
]

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<"overview" | "team" | "details">("overview")

  const company = mockCompanies.find(c => c.id === id)

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Company Not Found</h1>
        <p className="text-muted-foreground mb-4">The company you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/companies")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/companies")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>

      {/* Company Header */}
      <Card className="border border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                  <Badge variant="secondary" className="text-sm">
                    {company.industry}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company.foundedYear}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{company.employeeCount} employees</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-border">
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
          { id: "details", label: "Details" },
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
          <div className="md:col-span-2 space-y-6">
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

            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Key team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {company.teamMembers.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 border border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {company.teamMembers.length > 4 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-border"
                    onClick={() => setSelectedTab("team")}
                  >
                    View All Team Members ({company.teamMembers.length})
                  </Button>
                )}
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

            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-border">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Company
                </Button>
                <Button variant="outline" className="w-full justify-start border-border">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
                <Button variant="outline" className="w-full justify-start border-border">
                  <Users className="mr-2 h-4 w-4" />
                  View All Teams
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedTab === "team" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
              <p className="text-muted-foreground">
                {company.teamMembers.length} team members
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Users className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {company.teamMembers.map((member) => (
              <Card key={member.id} className="border border-border hover:bg-card-hover transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-border">
                      <Mail className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "details" && (
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Complete information about {company.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                    <p className="text-foreground font-medium">{company.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                    <p className="text-foreground">{company.industry}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p className="text-foreground">{company.location}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Founded Year</Label>
                    <p className="text-foreground">{company.foundedYear}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee Count</Label>
                    <p className="text-foreground">{company.employeeCount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Team Size</Label>
                    <p className="text-foreground">{company.teamMembers.length} members</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-foreground mt-2 leading-relaxed">{company.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Add Label component import
import { Label } from "@/components/ui/label"