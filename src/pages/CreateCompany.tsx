import { useState, ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Step = 1 | 2 | 3

const BANK_NAMES = [
  "Attijariwafa Bank",
  "Banque Populaire",
  "BMCE Bank of Africa",
  "CIH Bank",
  "Société Générale Maroc",
  "Crédit du Maroc",
  "Al Barid Bank",
  "CFG Bank",
  "Bank of Africa",
  "Umnia Bank",
]

export default function CreateCompany() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<Step>(1)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bankReleveFile, setBankReleveFile] = useState<File | null>(null)

  const [essential, setEssential] = useState({
    title: "",
    description: "",
    email: "",
    foundedYear: new Date().getFullYear(),
    nb_users: 2,
    status: "pending" as "pending" | "active" | "not active",
  })

  const [sector, setSector] = useState({
    phone1: "",
    phone2: "",
    website: "",
    email2: "",
  })

  const [financial, setFinancial] = useState({
    rc_number: "",
    if_number: "",
    cnss_number: "",
    patente_number: "",
    ice_number: "",
    bank_name: "",
    rib_number: "",
  })

  const validateStep1 = () => {
    const { title, description, email, foundedYear, nb_users, status } = essential
    if (!title || !description || !email || !foundedYear || !nb_users || !status || !logoFile) {
      toast({ title: "Step 1 incomplete", description: "Fill all required fields, including logo.", variant: "destructive" })
      return false
    }
    return true
  }
  const validateStep2 = () => {
    const { phone1, website, email2 } = sector
    if (!phone1 || !website || !email2) {
      toast({ title: "Step 2 incomplete", description: "phone1, website and email2 are required.", variant: "destructive" })
      return false
    }
    return true
  }
  const validateStep3 = () => {
    const { rc_number, if_number, cnss_number, patente_number, ice_number, bank_name, rib_number } = financial
    if (!rc_number || !if_number || !cnss_number || !patente_number || !ice_number || !bank_name || !rib_number || !bankReleveFile) {
      toast({ title: "Step 3 incomplete", description: "All financial fields and bank statement are required.", variant: "destructive" })
      return false
    }
    return true
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(prev => (prev < 3 ? ((prev + 1) as Step) : prev))
  }
  const goBack = () => setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    setIsSubmitting(true)

    const data = new FormData()
    // Essential
    data.append("title", essential.title)
    data.append("description", essential.description)
    data.append("email", essential.email)
    data.append("nb_users", String(essential.nb_users))
    data.append("status", essential.status)
    data.append("foundedYear", String(essential.foundedYear))
    if (logoFile) data.append("logo", logoFile)
    // Sector
    data.append("sector_phone1", sector.phone1)
    if (sector.phone2) data.append("sector_phone2", sector.phone2)
    data.append("sector_website", sector.website)
    data.append("sector_email2", sector.email2)
    // Financial
    data.append("rc_number", financial.rc_number)
    data.append("if_number", financial.if_number)
    data.append("cnss_number", financial.cnss_number)
    data.append("patente_number", financial.patente_number)
    data.append("ice_number", financial.ice_number)
    data.append("bank_name", financial.bank_name)
    data.append("rib_number", financial.rib_number)
    if (bankReleveFile) data.append("bank_releve", bankReleveFile)

    try {
      const res = await fetch("http://localhost:5000/companies/complete", {
        method: "POST",
        body: data,
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || "Failed to create company")
      }
      toast({ title: "Company created", description: `${essential.title} has been created.` })
      navigate("/companies")
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create company.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const Stepper = () => (
    <div className="flex items-center justify-between border border-border rounded-lg p-3 bg-card">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex-1 flex items-center justify-center">
          <div className={`flex items-center gap-2 ${step === n ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center border ${step === n ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'}`}>{n}</div>
            <span className="text-sm hidden sm:inline">{n === 1 ? 'Essential Info' : n === 2 ? 'Sector Info' : 'Financial Info'}</span>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Company</h1>
          <p className="text-muted-foreground">Fill all steps to create the company</p>
        </div>
      </div>

      <Stepper />

      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {step === 1 && (
          <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Company Title *</Label>
                <Input id="title" value={essential.title} onChange={(e) => setEssential({ ...essential, title: e.target.value })} required className="border-border focus:ring-primary" placeholder="Enter company title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email *</Label>
                <Input id="email" type="email" value={essential.email} onChange={(e) => setEssential({ ...essential, email: e.target.value })} required className="border-border focus:ring-primary" placeholder="contact@company.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={essential.description} onChange={(e) => setEssential({ ...essential, description: e.target.value })} required className="min-h-[100px] border-border focus:ring-primary" rows={4} placeholder="Describe what the company does..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year *</Label>
                <Input id="foundedYear" type="number" value={essential.foundedYear} onChange={(e) => setEssential({ ...essential, foundedYear: parseInt(e.target.value || '0') })} min="1800" max={new Date().getFullYear()} required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nb_users">Number of Users *</Label>
                <Input id="nb_users" type="number" value={essential.nb_users} onChange={(e) => setEssential({ ...essential, nb_users: parseInt(e.target.value || '0') })} min="1" required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={essential.status} onValueChange={(v) => setEssential({ ...essential, status: v as typeof essential.status })}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="not active">Not Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo *</Label>
              <Input id="logo" type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => setLogoFile(e.target.files?.[0] || null)} required className="border-border focus:ring-primary" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone1">Phone 1 *</Label>
                <Input id="phone1" value={sector.phone1} onChange={(e) => setSector({ ...sector, phone1: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2">Phone 2 (optional)</Label>
                <Input id="phone2" value={sector.phone2} onChange={(e) => setSector({ ...sector, phone2: e.target.value })} className="border-border focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website *</Label>
                <Input id="website" type="url" value={sector.website} onChange={(e) => setSector({ ...sector, website: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email2">Secondary Email *</Label>
                <Input id="email2" type="email" value={sector.email2} onChange={(e) => setSector({ ...sector, email2: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rc_number">RC Number *</Label>
                <Input id="rc_number" value={financial.rc_number} onChange={(e) => setFinancial({ ...financial, rc_number: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="if_number">IF Number *</Label>
                <Input id="if_number" value={financial.if_number} onChange={(e) => setFinancial({ ...financial, if_number: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnss_number">CNSS Number *</Label>
                <Input id="cnss_number" value={financial.cnss_number} onChange={(e) => setFinancial({ ...financial, cnss_number: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patente_number">Patente Number *</Label>
                <Input id="patente_number" value={financial.patente_number} onChange={(e) => setFinancial({ ...financial, patente_number: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ice_number">ICE Number *</Label>
                <Input id="ice_number" value={financial.ice_number} onChange={(e) => setFinancial({ ...financial, ice_number: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Select value={financial.bank_name} onValueChange={(v) => setFinancial({ ...financial, bank_name: v })}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_NAMES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rib_number">RIB Number *</Label>
                <Input id="rib_number" value={financial.rib_number} onChange={(e) => setFinancial({ ...financial, rib_number: e.target.value })} required className="border-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_releve">Bank Statement (Relevé) *</Label>
                <Input id="bank_releve" type="file" accept="image/*,application/pdf" onChange={(e: ChangeEvent<HTMLInputElement>) => setBankReleveFile(e.target.files?.[0] || null)} required className="border-border focus:ring-primary" />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting || step === 1} className="border-border">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={goNext} disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-primary-foreground">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-primary-foreground">
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}