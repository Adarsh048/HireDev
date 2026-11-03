import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileCheck2,
  BarChart3,
  Building2,
  Settings,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Recommended Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Saved Jobs', href: '/dashboard/saved', icon: Bookmark },
  { name: 'Application Tracker', href: '/dashboard/applications', icon: FileCheck2 },
  { name: 'Skill Gap & Demand', href: '/dashboard/skills', icon: BarChart3 },
  { name: 'Company Intelligence', href: '/dashboard/companies', icon: Building2 },
  { name: 'Upload Resume', href: '/upload', icon: Upload },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] p-4 hidden md:flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Candidate Portal
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-xs space-y-1">
        <p className="font-semibold text-foreground">India-Only Discovery</p>
        <p className="text-muted-foreground leading-relaxed">
          Verifying genuine vacancies across 10+ platforms every 24 hours.
        </p>
      </div>
    </aside>
  );
};

