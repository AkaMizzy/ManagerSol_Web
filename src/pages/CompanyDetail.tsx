import { useState, useEffect } from "react"
import { Building2, MapPin, Calendar, Users, Globe, Mail, Edit, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Company } from "@/components/CompanyCard"
import { Label } from "@/components/ui/label"

interface CompanyDetailProps {
  companyId: string
  onClose: () => void
}

export default function CompanyDetail({ companyId, onClose }: CompanyDetailProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<"overview" | "team" | "details">("overview")

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:5000/companies/${companyId}`)
      .then(res => res.json())
      .then((data) => {
        setCompany({
          id: data.id?.toString() || data.id,
          name: data.title || data.name || "Untitled Company",
          description: data.description || "",
          industry: "N/A",
          location: "N/A",
          foundedYear: 2020,
          employeeCount: data.nb_users || 0,
          logo: data.logo ? `http://localhost:5000${data.logo}` : undefined,
          teamMembers: [], // Placeholder
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Company Header */}
      <Card className="border border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-16 w-16 object-cover rounded" />
                ) : (
                  <Building2 className="h-10 w-10 text-primary-foreground" />
                )}
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
    </div>
  )
}