import { useState, useEffect } from "react"
import { Building2, Users, TrendingUp, Calendar, Activity, Bell, CheckCircle, Clock, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AdminUser {
  id: string
  name: string
  email: string
  company_id: string
  role: string
}

interface Company {
  id: string
  title: string
  description: string
  sector: string
  foundedYear: number
  nb_users: number
  status: string
  logo?: string
}

export default function Dashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get admin user from localStorage
    try {
      const authUser = localStorage.getItem('authUser')
      if (authUser) {
        const user = JSON.parse(authUser) as AdminUser
        setAdminUser(user)
        
        // Fetch company data
        if (user.company_id) {
          fetch(`http://localhost:5000/companies/${user.company_id}`)
            .then(res => res.json())
            .then((data) => {
              setCompany(data)
              setLoading(false)
            })
            .catch(() => {
              setError("Failed to fetch company data")
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      } else {
        setError("No authenticated user found")
        setLoading(false)
      }
    } catch {
      setError("Error loading user data")
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading dashboard...</div>
  }
  if (error) {
    return <div className="py-12 text-center text-destructive">{error}</div>
  }

  // Mock data for engagement
  const recentActivities = [
    { id: 1, text: "New team member joined", time: "2 hours ago", type: "success" },
    { id: 2, text: "Company profile updated", time: "1 day ago", type: "info" },
    { id: 3, text: "New task assigned", time: "2 days ago", type: "warning" },
  ]

  const companyStats = {
    tasksCompleted: 85,
    activeProjects: 12,
    teamGrowth: 15
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {adminUser?.name || 'Admin'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening at {company?.title || 'your company'} today
          </p>
        </div>
      </div>

      {/* Company Overview Card */}
      {company && (
        <Card className="border border-border shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {company.logo && (
                  <img 
                    src={`http://localhost:5000${company.logo}`} 
                    alt={company.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-2xl text-foreground">{company.title}</CardTitle>
                  <CardDescription className="text-base">{company.description}</CardDescription>
                </div>
              </div>
              <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                {company.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{company.foundedYear}</div>
                <div className="text-sm text-muted-foreground">Founded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{company.nb_users}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{company.sector}</div>
                <div className="text-sm text-muted-foreground">Industry</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{companyStats.tasksCompleted}%</div>
            <Progress value={companyStats.tasksCompleted} className="mt-2" />
            <p className="text-xs text-success mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{companyStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Growth
            </CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+{companyStats.teamGrowth}%</div>
            <p className="text-xs text-success mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              This quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'success' ? 'bg-success' : 
                    activity.type === 'warning' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <span className="text-sm text-foreground">{activity.text}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Manage Team</span>
                </div>
                <span className="text-xs text-muted-foreground">View & Edit</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">View Tasks</span>
                </div>
                <span className="text-xs text-muted-foreground">Manage</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Schedule Meeting</span>
                </div>
                <span className="text-xs text-muted-foreground">Plan</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}