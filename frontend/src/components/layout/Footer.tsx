import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-10 text-sm text-slate-500">
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A382C] text-white">
            <span className="font-mono font-bold text-xs text-emerald-400">&lt;/&gt;</span>
          </div>
          <span className="font-bold text-slate-900 text-base">DevNest</span>
          <span className="text-slate-400 text-xs sm:text-sm">— Platform for freshers & early-career developers</span>
        </div>

        <div className="flex items-center gap-6 text-xs sm:text-sm">
          <Link to="/dashboard/jobs" className="hover:text-slate-900 transition-colors">Jobs</Link>
          <Link to="/dashboard/jobs?type=internship" className="hover:text-slate-900 transition-colors">Internships</Link>
          <Link to="/dashboard/companies" className="hover:text-slate-900 transition-colors">Companies</Link>
          <Link to="/upload" className="hover:text-slate-900 transition-colors">Resume AI</Link>
        </div>
      </div>
    </footer>
  );
};
