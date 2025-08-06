import { Building2, Users, Plus, Home } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Teams", url: "/teams", icon: Users },
  { title: "Create Company", url: "/create-company", icon: Plus },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") return currentPath === path
    return currentPath.startsWith(path)
  }

  const getNavClass = (path: string) => 
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"

  return (
    <Sidebar
      className="transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="bg-background border-r border-border">
        <div className="flex items-center justify-between p-3 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">MangerSol</span>
            </div>
          )}
        <SidebarTrigger className="h-8 w-8" />
        </div>

        <SidebarGroup className="px-2 py-2">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-2">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`${getNavClass(item.url)} transition-all duration-200 rounded-lg`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}