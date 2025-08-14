import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FolderOpen, MapPin, Users, Boxes } from 'lucide-react';
import ProjectList from './ProjectList';
import ZoneList from './ZoneList';
import ControlList from './ControlList';
import CreateProjectModal from './CreateProjectModal';
import CreateZoneModal from './CreateZoneModal';
import CreateControlModal from './CreateControlModal';
import ControlCalendar from './ControlCalendar';
import ZoneBlocManager from './ZoneBlocManager';

interface Project {
  id: string;
  title: string;
  id_company: string;
  dd: string;
  df: string;
  status?: string | null;
  project_type_title?: string | null;
}

interface Zone {
  id: string;
  title: string;
  code: string;
}

interface Control {
  id: string;
  project: string;
  zone: string;
  taskgroup: string;
  dd: string;
  df: string;
  user: string;
  project_title: string;
  zone_title: string;
  taskgroup_title: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface SimpleUser { id: string; firstname: string; lastname: string; }

const ProjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateZone, setShowCreateZone] = useState(false);
  const [showCreateControl, setShowCreateControl] = useState(false);

  // Get company ID from user context or localStorage
  const companyId = localStorage.getItem('companyId') || '';
  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

  useEffect(() => {
    (async () => {
      if (!companyId && auth?.id && auth?.role === 'admin') {
        try {
          const r = await fetch(`http://localhost:5000/users/${auth.id}`);
          if (r.ok) {
            const u = await r.json();
            if (u?.company_id) {
              localStorage.setItem('companyId', u.company_id);
              setLoading(true);
              fetchData();
              return;
            }
          }
        } catch (e) {
          console.warn('Could not auto-resolve companyId:', e);
        }
      }
      if (companyId) {
        fetchData();
      } else {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, auth?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsResponse = await fetch(`http://localhost:5000/projects/${companyId}`, { headers: { 'Content-Type': 'application/json', ...authHeader } });
      let projectsData: Project[] = [];
      if (projectsResponse.ok) {
        projectsData = await projectsResponse.json();
        setProjects(projectsData);
      } else {
        setProjects([]);
      }

      // Fetch zones
      const zonesResponse = await fetch('http://localhost:5000/zones', { headers: { 'Content-Type': 'application/json', ...authHeader } });
      if (zonesResponse.ok) {
        const zonesData = await zonesResponse.json();
        setZones(zonesData);
      }

      // Fetch users for filters
      const usersResponse = await fetch(`http://localhost:5000/users/company/${companyId}`, { headers: { 'Content-Type': 'application/json', ...authHeader } });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers((usersData || []).map((u: any) => ({ id: u.id, firstname: u.firstname, lastname: u.lastname })));
      }

      // Fetch controls for the company's projects using fresh projectsData
      if (projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const allControls: Control[] = [];
        for (const projectId of projectIds) {
          const controlsResponse = await fetch(`http://localhost:5000/controls/project/${projectId}`, { headers: { 'Content-Type': 'application/json', ...authHeader } });
          if (controlsResponse.ok) {
            const controlsData = await controlsResponse.json();
            allControls.push(...controlsData);
          }
        }
        setControls(allControls);
      } else {
        setControls([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setShowCreateProject(false);
  };

  const handleZoneCreated = (newZone: Zone) => {
    setZones(prev => [newZone, ...prev]);
    setShowCreateZone(false);
  };

  const handleControlCreated = (newControl: Control) => {
    setControls(prev => [newControl, ...prev]);
    setShowCreateControl(false);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Also remove related controls
    setControls(prev => prev.filter(c => c.project !== projectId));
  };

  const handleZoneDeleted = (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  const handleControlDeleted = (controlId: string) => {
    setControls(prev => prev.filter(c => c.id !== controlId));
  };

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-600">
          <div className="text-lg font-medium">No company selected</div>
          <div className="text-sm">Please log in as Admin or set companyId in localStorage.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
        <p className="text-gray-600 mt-2">
          Manage projects, zones, and control assignments for your company
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="zoneBlocs" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Zone Blocs
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Controls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Button onClick={() => setShowCreateProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </CardHeader>
            <CardContent>
              <ProjectList 
                projects={projects}
                onProjectDeleted={handleProjectDeleted}
                onRefresh={fetchData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Zones</CardTitle>
              <Button onClick={() => setShowCreateZone(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Zone
              </Button>
            </CardHeader>
            <CardContent>
              <ZoneList 
                zones={zones} 
                onZoneDeleted={handleZoneDeleted}
                onRefresh={fetchData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zoneBlocs" className="space-y-4">
          <ZoneBlocManager />
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Control Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <ControlCalendar controls={controls} projects={projects} zones={zones} users={users} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Control Assignments</CardTitle>
              <Button onClick={() => setShowCreateControl(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Control
              </Button>
            </CardHeader>
            <CardContent>
              <ControlList 
                controls={controls} 
                onControlDeleted={handleControlDeleted}
                onRefresh={fetchData}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          companyId={companyId}
          onClose={() => setShowCreateProject(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {showCreateZone && (
        <CreateZoneModal
          onClose={() => setShowCreateZone(false)}
          onZoneCreated={handleZoneCreated}
        />
      )}

      {showCreateControl && (
        <CreateControlModal
          projects={projects}
          zones={zones}
          companyId={companyId}
          onClose={() => setShowCreateControl(false)}
          onControlCreated={handleControlCreated}
        />
      )}
    </div>
  );
};

export default ProjectManagement; 