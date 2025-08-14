import { useState, useEffect } from "react"
import { User, Mail, Phone, Building2, Calendar, Shield, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  authHeader?: { Authorization: string }
  isManager?: boolean
}

interface UserDetails {
  id: string
  firstname: string
  lastname: string
  email: string
  email_second?: string
  identifier?: string
  phone1?: string
  phone2?: string
  status?: string
  role?: string
  company_id: string
  linked_at?: string
}

interface Company {
  id: string
  title: string
  email?: string
  sector?: string
}

export function UserDetailsModal({ isOpen, onClose, userId, authHeader, isManager }: UserDetailsModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails()
    }
  }, [isOpen, userId])

  const fetchUserDetails = async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Fetch user details
      const userResponse = await fetch(
        isManager 
          ? `http://localhost:5000/manager/users/${userId}`
          : `http://localhost:5000/users/${userId}`,
        { headers: authHeader }
      )
      
      if (!userResponse.ok) throw new Error('Failed to fetch user details')
      
      const userData = await userResponse.json()
      setUser(userData)
      
      // Fetch company details
      const companyResponse = await fetch(`http://localhost:5000/companies/${userData.company_id}`)
      if (companyResponse.ok) {
        const companyData = await companyResponse.json()
        setCompany(companyData)
      }
      
    } catch (err) {
      setError('Failed to load user details')
      console.error('Error fetching user details:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'inactive': return 'destructive'
      default: return 'outline'
    }
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'default'
      case 'superadmin': return 'destructive'
      case 'user': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              User Details
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading user details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <User className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchUserDetails}>
                Try Again
              </Button>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Header */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {user.firstname[0]}{user.lastname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {user.firstname} {user.lastname}
                      </h3>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status || 'No Status'}
                      </Badge>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        <Shield className="mr-1 h-3 w-3" />
                        {user.role || 'User'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Primary Email</label>
                      <p className="text-foreground">{user.email}</p>
                    </div>
                    {user.email_second && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Secondary Email</label>
                        <p className="text-foreground">{user.email_second}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {user.phone1 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Primary Phone</label>
                        <p className="text-foreground flex items-center">
                          <Phone className="mr-2 h-3 w-3" />
                          {user.phone1}
                        </p>
                      </div>
                    )}
                    {user.phone2 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Secondary Phone</label>
                        <p className="text-foreground flex items-center">
                          <Phone className="mr-2 h-3 w-3" />
                          {user.phone2}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            {company && (
              <Card className="border border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center">
                    <Building2 className="mr-2 h-4 w-4" />
                    Company Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                      <p className="text-foreground font-medium">{company.title}</p>
                    </div>
                    {company.sector && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Industry</label>
                        <p className="text-foreground">{company.sector}</p>
                      </div>
                    )}
                    {company.email && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Company Email</label>
                        <p className="text-foreground">{company.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.identifier && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Identifier</label>
                      <p className="text-foreground">{user.identifier}</p>
                    </div>
                  )}
                  {user.linked_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                      <p className="text-foreground flex items-center">
                        <Calendar className="mr-2 h-3 w-3" />
                        {formatDate(user.linked_at)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="default" onClick={() => window.open(`mailto:${user.email}`, '_blank')}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}