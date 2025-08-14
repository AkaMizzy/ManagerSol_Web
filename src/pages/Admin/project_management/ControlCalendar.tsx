import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event as RBCEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Control {
  id: string;
  project: string;
  zone: string;
  taskgroup: string;
  dd: string; // ISO date
  df: string; // ISO date
  user: string;
  project_title: string;
  zone_title: string;
  taskgroup_title: string;
  firstname: string;
  lastname: string;
}

interface Project { id: string; title: string; }
interface Zone { id: string; title: string; }
interface User { id: string; firstname: string; lastname: string; }

interface ControlCalendarProps {
  controls: Control[];
  projects: Project[];
  zones: Zone[];
  users: User[];
}

const locales = { fr } as any;
const localizer = dateFnsLocalizer({
  format,
  parse: (str: string, fmt: string, refDate: Date) => parse(str, fmt, refDate, { locale: fr }),
  startOfWeek,
  getDay,
  locales,
});

const ALL = '__ALL__';

const ControlCalendar: React.FC<ControlCalendarProps> = ({ controls, projects, zones, users }) => {
  const [filterUser, setFilterUser] = useState<string>(ALL);
  const [filterProject, setFilterProject] = useState<string>(ALL);
  const [filterZone, setFilterZone] = useState<string>(ALL);

  const filteredControls = useMemo(() => {
    return controls.filter(c => (
      (filterUser === ALL || c.user === filterUser) &&
      (filterProject === ALL || c.project === filterProject) &&
      (filterZone === ALL || c.zone === filterZone)
    ));
  }, [controls, filterUser, filterProject, filterZone]);

  const events: RBCEvent[] = useMemo(() => {
    return filteredControls
      .map(c => {
        const start = new Date(c.dd);
        const end = new Date(c.df);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
        return {
          id: c.id,
          title: `${c.firstname} ${c.lastname} • ${c.project_title} • ${c.zone_title}`,
          start,
          end,
          allDay: true,
          resource: c,
        } as RBCEvent;
      })
      .filter(Boolean) as RBCEvent[];
  }, [filteredControls]);

  const safeUsers = users.filter(u => u && typeof u.id === 'string' && u.id.trim().length > 0);
  const safeProjects = projects.filter(p => p && typeof (p as any).id === 'string' && (p as any).id.trim().length > 0);
  const safeZones = zones.filter(z => z && typeof (z as any).id === 'string' && (z as any).id.trim().length > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par utilisateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les utilisateurs</SelectItem>
            {safeUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.firstname} {u.lastname}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par projet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les projets</SelectItem>
            {safeProjects.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterZone} onValueChange={setFilterZone}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les zones</SelectItem>
            {safeZones.map((z: any) => (
              <SelectItem key={z.id} value={z.id}>{z.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded border">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 550 }}
          views={["month", "week", "day"]}
          popup
        />
      </div>
    </div>
  );
};

export default ControlCalendar; 