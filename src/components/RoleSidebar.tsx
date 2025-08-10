import { AppSidebar } from "@/components/AppSidebar"
import { SuperAdminSidebar } from "@/pages/SuperAdmin/SuperAdminSidebar"
import { AdminSidebar } from "@/pages/Admin/AdminSidebar"

export function RoleSidebar() {
  let role: string | undefined
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
    const u = raw ? JSON.parse(raw) : null
    role = u?.role
  } catch {
    role = undefined
  }

  if (role === 'superAdmin') return <SuperAdminSidebar />
  if (role === 'admin') return <AdminSidebar />
  return <AppSidebar />
}


