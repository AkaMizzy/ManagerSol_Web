import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface TeamMemberForm {
  id: string
  name: string
  role: string
  email: string
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Consulting",
  "Media",
  "Transportation",
  "Energy",
  "Food & Beverage",
  "Other"
]

export default function CreateCompany() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    foundedYear: new Date().getFullYear(),
    employeeCount: 1,
    website: "",
  })

  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([
    { id: "1", name: "", role: "", email: "" }
  ])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTeamMember = () => {
    const newId = Date.now().toString()
    setTeamMembers(prev => [...prev, { id: newId, name: "", role: "", email: "" }])
  }

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(prev => prev.filter(member => member.id !== id))
    }
  }

  const updateTeamMember = (id: string, field: string, value: string) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (!formData.name || !formData.industry || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Company Created!",
        description: `${formData.name} has been successfully created.`,
      })
      setIsSubmitting(false)
      navigate("/companies")
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Company</h1>
          <p className="text-muted-foreground">
            Add a new company to your organization
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Basic information about the company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter company name"
                  className="border-border focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what the company does..."
                className="min-h-[100px] border-border focus:ring-primary"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, State/Country"
                  className="border-border focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => handleInputChange("foundedYear", parseInt(e.target.value))}
                  className="border-border focus:ring-primary"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange("employeeCount", parseInt(e.target.value))}
                  className="border-border focus:ring-primary"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://company.com"
                className="border-border focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Add key team members and their roles
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTeamMember}
                className="border-border"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">Member {index + 1}</Badge>
                  {teamMembers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamMember(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Full Name</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => updateTeamMember(member.id, "name", e.target.value)}
                      placeholder="John Doe"
                      className="border-border focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm">Role</Label>
                    <Input
                      value={member.role}
                      onChange={(e) => updateTeamMember(member.id, "role", e.target.value)}
                      placeholder="CEO, Developer, Designer..."
                      className="border-border focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm">Email</Label>
                    <Input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(member.id, "email", e.target.value)}
                      placeholder="john@company.com"
                      className="border-border focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center space-x-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Company
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="border-border"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}