import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  Briefcase,
  Bookmark,
  Building2,
  BookOpen,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8 max-w-7xl">
        {/* Brand Logo: DevNest */}
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A382C] text-white shadow-sm transition-transform group-hover:scale-105">
            <span className="font-mono font-bold text-lg tracking-tighter text-emerald-400">&lt;/&gt;</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            DevNest
          </span>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
          <Link
            to="/dashboard/jobs"
            className={cn(
              'px-4 py-2 rounded-full transition-all text-sm font-semibold',
              isCurrent('/dashboard/jobs') || isCurrent('/')
                ? 'bg-[#E6F4EA] text-[#064E3B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
            )}
          >
            Jobs
          </Link>
          <Link
            to="/dashboard/jobs?type=internship"
            className={cn(
              'px-4 py-2 rounded-full transition-all text-sm font-medium',
              location.search.includes('internship')
                ? 'bg-[#E6F4EA] text-[#064E3B]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
            )}
          >
            Internships
          </Link>
          <Link
            to="/dashboard/companies"
            className={cn(
              'px-4 py-2 rounded-full transition-all text-sm font-medium',
              isCurrent('/dashboard/companies')
                ? 'bg-[#E6F4EA] text-[#064E3B]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
            )}
          >
            Companies
          </Link>
          <Link
            to="/dashboard/saved"
            className={cn(
              'px-4 py-2 rounded-full transition-all text-sm font-medium',
              isCurrent('/dashboard/saved')
                ? 'bg-[#E6F4EA] text-[#064E3B]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
            )}
          >
            Saved
          </Link>
          
          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all outline-none">
              <span>Resources</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg">
              <DropdownMenuItem asChild>
                <Link to="/upload" className="cursor-pointer gap-2">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Resume Review</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/skills" className="cursor-pointer gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>Skill Analysis</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/applications" className="cursor-pointer gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span>Application Tracker</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Notification Bell with unread indicator dot */}
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 focus:outline-none">
                  <Avatar className="h-10 w-10 border border-emerald-200">
                    <AvatarFallback className="bg-emerald-100 text-[#064E3B] font-bold text-sm">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : 'DN'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline font-semibold text-sm text-slate-800">
                    {user.name?.split(' ')[0] || 'Developer'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/jobs" className="cursor-pointer gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Recommended Jobs</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/saved" className="cursor-pointer gap-2">
                    <Bookmark className="h-4 w-4" />
                    <span>Saved Jobs</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:text-destructive gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="h-10 rounded-full border-slate-300 px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-all"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                className="h-10 rounded-full bg-[#0A382C] px-5 text-sm font-semibold text-white shadow-xs hover:bg-[#065F46] transition-all"
                asChild
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          <Link
            to="/dashboard/jobs"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#E6F4EA] text-[#064E3B]"
          >
            Jobs
          </Link>
          <Link
            to="/dashboard/jobs?type=internship"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Internships
          </Link>
          <Link
            to="/dashboard/companies"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Companies
          </Link>
          <Link
            to="/dashboard/saved"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Saved Jobs
          </Link>
          <Link
            to="/upload"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Upload Resume
          </Link>
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            {!user && (
              <>
                <Button variant="outline" className="w-1/2 rounded-full" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                </Button>
                <Button className="w-1/2 rounded-full bg-[#0A382C] text-white" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
