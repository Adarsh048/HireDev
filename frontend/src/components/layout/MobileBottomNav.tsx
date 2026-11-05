import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Upload, FileCheck2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav: React.FC = () => {
  const items = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { label: 'Upload', href: '/upload', icon: Upload, highlight: true },
    { label: 'Tracker', href: '/dashboard/applications', icon: FileCheck2 },
    { label: 'Profile', href: '/review', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 md:hidden px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors relative',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
                item.highlight &&
                  'text-primary font-semibold',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1 rounded-lg transition-transform',
                    item.highlight
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm p-1.5 -mt-3 ring-4 ring-background'
                      : isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                      : '',
                  )}
                >
                  <item.icon className={cn('h-5 w-5', item.highlight && 'h-5 w-5 text-white')} />
                </div>
                <span className={cn('mt-0.5', item.highlight && '-mt-0.5')}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

