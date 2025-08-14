import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Boxes, User, Users, Mail, Building2, Link2, Crown } from 'lucide-react'

interface Props {
  userId: string
  onClose: () => void
  onOpenManageAssignments?: (userId: string) => void
}

interface UserDto {
  id: string
  firstname: string
  lastname: string
  email: string
  role?: string | null
  status?: string | null
  company_id?: string | null
  manager_id?: string | null
}

interface CompanyDto { id: string; title: string; sector?: string | null }

interface Assignment {
  id: string
  id_zone?: string | null
  id_bloc?: string | null
  zone_title?: string | null
  bloc_title?: string | null
}

const UserDetailsModal: React.FC<Props> = ({ userId, onClose, onOpenManageAssignments }) => {
  const [user, setUser] = useState<UserDto | null>(null)
  const [company, setCompany] = useState<CompanyDto | null>(null)
  const [manager, setManager] = useState<UserDto | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subs, setSubs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  const auth = authRaw ? JSON.parse(authRaw) : null
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const rUser = await fetch(`http://localhost:5000/users/${userId}`, { headers: { 'Content-Type': 'application/json', ...authHeader } })
        const u = rUser.ok ? await rUser.json() : null
        setUser(u)
        if (u?.company_id) {
          const rc = await fetch('http://localhost:5000/companies')
          const companies: CompanyDto[] = rc.ok ? await rc.json() : []
          setCompany(companies.find(c => c.id === u.company_id) || null)
        }
        if (u?.manager_id) {
          const rm = await fetch(`http://localhost:5000/users/${u.manager_id}`)
          setManager(rm.ok ? await rm.json() : null)
        }
        const ra = await fetch(`http://localhost:5000/users/${userId}/assignments`)
        setAssignments(ra.ok ? await ra.json() : [])
        const rs = await fetch(`http://localhost:5000/users/${userId}/subordinates`)
        setSubs(rs.ok ? await rs.json() : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const initials = useMemo(() => {
    const name = `${user?.firstname || ''} ${user?.lastname || ''}`.trim()
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'
  }, [user])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profil utilisateur
          </DialogTitle>
        </DialogHeader>

        {loading || !user ? (
          <div className="py-10 text-center text-muted-foreground">Chargement...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-semibold">{user.firstname} {user.lastname}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{user.role || 'user'}</Badge>
                  {user.status && <Badge variant="outline">{user.status}</Badge>}
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${user.email}`}><Mail className="h-4 w-4 mr-1"/>Email</a>
                </Button>
                {onOpenManageAssignments && (
                  <Button size="sm" onClick={() => onOpenManageAssignments(user.id)}><Link2 className="h-4 w-4 mr-1"/>Gérer affectations</Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm font-medium flex items-center gap-2"><Building2 className="h-4 w-4"/> Société</div>
                <div className="pl-6">
                  <div className="font-medium">{company?.title || 'Unknown'}</div>
                  {company?.sector && <div className="text-xs text-muted-foreground">{company.sector}</div>}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-medium flex items-center gap-2"><Crown className="h-4 w-4"/> Manager</div>
                <div className="pl-6">
                  <div className="font-medium">{manager ? `${manager.firstname} ${manager.lastname}` : '—'}</div>
                  {manager && <div className="text-xs text-muted-foreground">{manager.email}</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium flex items-center gap-2 mb-2"><MapPin className="h-4 w-4"/> Zones</div>
                <div className="pl-6 flex flex-wrap gap-2">
                  {assignments.filter(a => a.id_zone).length === 0 ? (
                    <span className="text-xs text-muted-foreground">Aucune</span>
                  ) : (
                    assignments.filter(a => a.id_zone).map(a => (
                      <Badge key={a.id} variant="secondary">{a.zone_title}</Badge>
                    ))
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium flex items-center gap-2 mb-2"><Boxes className="h-4 w-4"/> Blocs</div>
                <div className="pl-6 flex flex-wrap gap-2">
                  {assignments.filter(a => a.id_bloc).length === 0 ? (
                    <span className="text-xs text-muted-foreground">Aucun</span>
                  ) : (
                    assignments.filter(a => a.id_bloc).map(a => (
                      <Badge key={a.id} variant="secondary">{a.bloc_title}</Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium flex items-center gap-2 mb-2"><Users className="h-4 w-4"/> Subordonnés</div>
              <div className="pl-6 flex flex-wrap gap-2">
                {subs.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Aucun</span>
                ) : (
                  subs.map(id => <Badge key={id} variant="outline">{id}</Badge>)
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Fermer</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsModal 