import { Building2, Users, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { useNavigate } from "react-router-dom"

export interface Company {
  id: string
  name: string
  description: string
  industry: string
  location: string
  foundedYear: number
  employeeCount: number
  logo?: string
  teamMembers: TeamMember[]
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  email: string
}

interface CompanyCardProps {
  company: Company
  onClick?: () => void
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  // const navigate = useNavigate()

  // const handleViewDetails = () => {
  //   navigate(`/companies/${company.id}`)
  // }

  return (
    <Card className="hover:bg-card-hover transition-all duration-200 cursor-pointer group border border-border shadow-sm hover:shadow-md" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-16 w-16 object-cover rounded" />
              ) : (
                <Building2 className="h-10 w-10 text-primary-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {company.name}
              </CardTitle>
              {company.industry ? (
                <Badge variant="secondary" className="mt-1">
                  {company.industry}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {company.description ? (
          <CardDescription className="text-muted-foreground line-clamp-2">
            {company.description}
          </CardDescription>
        ) : null}

        {(company.location || company.foundedYear || company.employeeCount) ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {company.location ? (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{company.location}</span>
                </div>
              ) : null}
              {company.foundedYear ? (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Founded {company.foundedYear}</span>
                </div>
              ) : null}
            </div>
            {typeof company.employeeCount === 'number' && company.employeeCount > 0 ? (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{company.employeeCount} employees</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {company.teamMembers && company.teamMembers.length > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Team:</span>
              <div className="flex -space-x-2">
                {company.teamMembers.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={member.avatar} alt={member.name || ''} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {(member.name || '?').split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {company.teamMembers.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                    +{company.teamMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}