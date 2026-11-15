import {
  BookOpen,
  Brain,
  CalendarDays,
  Cloud,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  type LucideIcon,
  Map as MapIcon,
  Route,
  Server,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const roadmapIcons: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  server: Server,
  sparkles: Sparkles,
  cloud: Cloud,
  route: Route,
  library: Library,
  map: MapIcon,
  book: BookOpen,
  brain: Brain,
  target: Target,
  users: Users,
};

export function roadmapIcon(name: string): LucideIcon {
  return roadmapIcons[name] ?? Route;
}

export const icons = {
  dashboard: LayoutDashboard,
  roadmaps: Map,
  coach: Sparkles,
  practice: Brain,
  flashcards: GraduationCap,
  goals: Target,
  resources: Library,
  people: Users,
  notes: FileText,
  search: Library,
  settings: Settings,
  calendar: CalendarDays,
};
