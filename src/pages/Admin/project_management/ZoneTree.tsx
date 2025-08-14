import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, ChevronDown, MapPin } from 'lucide-react'

export interface ZoneNode {
  id: string
  title: string
  code: string
  id_zone?: string | null
  level?: number
  children?: ZoneNode[]
}

interface ZoneTreeProps {
  className?: string
  refreshKey?: string | number
}

const ZoneTree: React.FC<ZoneTreeProps> = ({ className, refreshKey }) => {
  const [tree, setTree] = useState<ZoneNode[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState<boolean>(true)

  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  const auth = authRaw ? JSON.parse(authRaw) : null
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:5000/zones-tree', { headers: { 'Content-Type': 'application/json', ...authHeader } })
        if (res.ok) {
          const data = await res.json()
          setTree(Array.isArray(data) ? data : [data])
        } else {
          setTree([])
        }
      } catch (e) {
        setTree([])
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const hasChildren = (node: ZoneNode) => Array.isArray(node.children) && node.children.length > 0

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const renderNode = (node: ZoneNode, depth: number) => {
    const isExpanded = !!expanded[node.id]
    
    return (
      <div key={node.id} className="flex flex-col">
        {/* Node content */}
        <div className="flex items-center py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
          {hasChildren(node) ? (
            <button 
              type="button" 
              onClick={() => toggle(node.id)} 
              className="mr-3 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="inline-block w-6 mr-3" />
          )}
          
          <div className="flex items-center gap-3 flex-1">
            <div className="p-1.5 rounded-md bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm text-foreground">{node.title}</span>
              <Badge variant="outline" className="w-fit mt-1 text-xs">{node.code}</Badge>
            </div>
          </div>
        </div>
        
        {/* Children container - horizontal layout */}
        {isExpanded && hasChildren(node) && (
          <div className="ml-6 mt-2 border-l-2 border-muted">
            <div className="pl-4 space-y-1">
              {node.children!.map(child => (
                <div key={child.id} className="relative">
                  {/* Connector line */}
                  <div className="absolute -left-4 top-4 w-4 h-0.5 bg-muted"></div>
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const content = useMemo(() => {
    if (loading) return <div className="text-sm text-muted-foreground">Chargement de la hiérarchie...</div>
    if (!tree || tree.length === 0) return <div className="text-sm text-muted-foreground">Aucune hiérarchie disponible</div>
    return tree.map(root => renderNode(root, 0))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree, expanded, loading])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Hiérarchie des zones</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}

export default ZoneTree 