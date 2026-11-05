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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 md:hidden px-2 py-1.5 safe-area-bottom">
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
                  ? 'text-emerald-800 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1 rounded-lg transition-transform',
                    item.highlight
                      ? 'bg-[#0A382C] text-white shadow-sm p-1.5 -mt-3 ring-4 ring-white dark:ring-slate-900'
                      : isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
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
