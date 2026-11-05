import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  Settings,
  Briefcase,
  FileCheck2,
  BarChart3,
  Building2,
  Bookmark,
  Upload,
  LayoutDashboard,
  Menu,
  X,
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
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { label: 'Saved', href: '/dashboard/saved', icon: Bookmark },
    { label: 'Tracker', href: '/dashboard/applications', icon: FileCheck2 },
    { label: 'Skill Gap', href: '/dashboard/skills', icon: BarChart3 },
    { label: 'Companies', href: '/dashboard/companies', icon: Building2 },
    { label: 'Upload Resume', href: '/upload', icon: Upload },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-card border border-indigo-200 dark:border-indigo-900/50 p-1 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
            <img src="/logo.png" alt="DevLaunch" className="h-full w-full object-contain" />
          </div>
          <span className="font-extrabold tracking-tight">
            Dev<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Launch</span>
          </span>
        </Link>

        {/* Desktop Navigation links if authenticated */}
        {user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/dashboard"
              className={cn(
                'transition-colors hover:text-foreground',
                location.pathname === '/dashboard' ? 'text-foreground font-semibold' : 'text-muted-foreground',
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/jobs"
              className={cn(
                'transition-colors hover:text-foreground',
                location.pathname === '/dashboard/jobs' ? 'text-foreground font-semibold' : 'text-muted-foreground',
              )}
            >
              Jobs
            </Link>
            <Link
              to="/dashboard/applications"
              className={cn(
                'transition-colors hover:text-foreground',
                location.pathname === '/dashboard/applications' ? 'text-foreground font-semibold' : 'text-muted-foreground',
              )}
            >
              Tracker
            </Link>
            <Link
              to="/dashboard/skills"
              className={cn(
                'transition-colors hover:text-foreground',
                location.pathname === '/dashboard/skills' ? 'text-foreground font-semibold' : 'text-muted-foreground',
              )}
            >
              Skill Gap
            </Link>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full h-9 w-9"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border border-indigo-200 dark:border-indigo-900/50">
                      <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                        {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'Candidate'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/review')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Review Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4 text-destructive" />
                    <span className="text-destructive font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Hamburger Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden h-9 w-9 rounded-lg"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay Drawer */}
      {mobileOpen && user && (
        <div className="md:hidden border-b bg-background/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-2">
            Navigation
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition-colors border',
                  location.pathname === item.href
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="text-xs text-destructive hover:text-destructive h-8 px-2"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" /> Log out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
