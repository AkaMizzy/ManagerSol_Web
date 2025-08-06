import { useState, ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function CreateCompany() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    email: "",
    nb_users: 1,
    status: "pending",
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.title || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title, email).",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("email", formData.email)
    data.append("nb_users", String(formData.nb_users))
    data.append("status", formData.status)
    if (logoFile) {
      data.append("logo", logoFile)
    }

    try {
      const res = await fetch("http://localhost:5000/companies", {
        method: "POST",
        body: data,
      })
      if (!res.ok) throw new Error("Failed to create company")
      toast({
        title: "Company Created!",
        description: `${formData.title} has been successfully created.`,
      })
      setIsSubmitting(false)
      navigate("/companies")
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create company.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
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

      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {/* Company Information */}
        <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Company Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
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
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
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
                value={formData.nb_users}
                onChange={(e) => handleInputChange("nb_users", parseInt(e.target.value))}
                className="border-border focus:ring-primary"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="border-border focus:ring-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="border-border focus:ring-primary"
            />
          </div>
        </div>
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