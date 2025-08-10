import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { RoleSidebar } from "@/components/RoleSidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Search, Bell, User, LogOut, Settings, UserCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  let displayName = ""
  let displayEmail = ""
  try {
    const raw = localStorage.getItem('authUser')
    if (raw) {
      const u = JSON.parse(raw)
      const first = (u?.firstname || "").toString().trim()
      const last = (u?.lastname || "").toString().trim()
      displayName = [first, last].filter(Boolean).join(" ") || u?.email || "User"
      displayEmail = u?.email || ""
    }
  } catch (e) {
    // ignore parsing errors, fall back to defaults
  }

  const handleDisconnect = () => {
    try {
      localStorage.removeItem('authUser')
      sessionStorage.removeItem('authUser')
    } catch (e) {
      // ignore storage errors
    }
    navigate("/")
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <RoleSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-4">
            
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="h-8 w-64 pl-7 text-sm border-border focus:ring-primary"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-popover border border-border shadow-lg z-50"
                  sideOffset={8}
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayEmail}</p>
                  </div>
                  
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-border" />
                  
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}