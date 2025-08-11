import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, Eye, EyeOff, Building2 } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Login failed')
      }
      const data = await res.json()
      const role = data?.role
      // Persist minimal auth info for routing guard or later use
      localStorage.setItem('authUser', JSON.stringify({ id: data?.id, email: data?.email, role, token: data?.token, firstname: data?.firstname, lastname: data?.lastname }))

      // Store companyId if provided by backend
      if (data?.company_id) {
        localStorage.setItem('companyId', data.company_id)
      } else if (role === 'admin') {
        try {
          const companyRes = await fetch(`http://localhost:5000/users/${data?.id}`)
          if (companyRes.ok) {
            const user = await companyRes.json()
            if (user?.company_id) {
              localStorage.setItem('companyId', user.company_id)
            }
          }
        } catch (e) {
          // ignore optional enrichment failure
          console.warn('Could not resolve companyId for admin:', e)
        }
      }

      if (role === 'superAdmin' || role === 'admin') {
        navigate('/dashboard')
      } else if (role === 'user') {
        setError('Your account does not have access to the admin area.')
      } else {
        setError('Unauthorized role.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-background p-4">
      {/* Enhanced gradient mesh + subtle blurred blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/35 blur-3xl animate-pulse" />
        <div className="absolute top-16 -right-24 h-[24rem] w-[24rem] rounded-full bg-primary/25 blur-3xl animate-pulse" style={{ animationDelay: '0.6s' }} />
        <div className="absolute bottom-[-2rem] -left-10 h-[26rem] w-[26rem] rounded-full bg-accent/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-8 -right-10 h-[22rem] w-[22rem] rounded-full bg-secondary/30 blur-2xl animate-pulse" style={{ animationDelay: '1.4s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome to ManagerSol
            </h1>
            <p className="text-muted-foreground">
              Sign in to manage your companies
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 border-border/50 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 h-11 border-border/50 focus:border-primary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{" "}
            <button className="text-primary hover:text-primary/80 font-medium transition-colors">
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
