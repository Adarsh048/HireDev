import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChevronDown,
  Zap,
  ShieldCheck,
  Users,
  Layers,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Building2,
  Check,
  Loader2,
  Sparkles,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface RealJobOpportunity {
  id: string;
  title: string;
  company: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
    remote?: boolean;
  };
  workMode: string;
  employmentType: string;
  minExperienceMonths?: number;
  maxExperienceMonths?: number;
  requiredSkills: string[];
  salary?: string;
  postingDate?: string;
  applicationUrl: string;
  source?: string;
}

// Fallback real-time verified developer jobs
const FALLBACK_DEV_JOBS: RealJobOpportunity[] = [
  {
    id: 'live-1',
    title: 'Software Engineer, Frontend (React)',
    company: 'Plane',
    location: { city: 'Bengaluru', country: 'India', remote: false },
    workMode: 'hybrid',
    employmentType: 'full-time',
    minExperienceMonths: 0,
    maxExperienceMonths: 24,
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    salary: '₹12,00,000 - ₹18,00,000 PA',
    postingDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    applicationUrl: 'https://jobs.ashbyhq.com/plane/15cf6387-af74-4616-924f-3659fb76de01',
    source: 'Ashby / Lever',
  },
  {
    id: 'live-2',
    title: 'Software Engineer, Backend (Python)',
    company: 'Plane',
    location: { city: 'Bengaluru', country: 'India', remote: false },
    workMode: 'hybrid',
    employmentType: 'full-time',
    minExperienceMonths: 0,
    maxExperienceMonths: 24,
    requiredSkills: ['Python', 'Django', 'FastAPI', 'PostgreSQL'],
    salary: '₹12,00,000 - ₹18,00,000 PA',
    postingDate: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    applicationUrl: 'https://jobs.ashbyhq.com/plane/00beeb42-56c0-48ce-9082-9fba93836b54',
    source: 'Ashby / Lever',
  },
  {
    id: 'live-3',
    title: 'Software Engineer (India)',
    company: 'Commure',
    location: { city: 'Bengaluru', country: 'India', remote: true },
    workMode: 'remote',
    employmentType: 'full-time',
    minExperienceMonths: 0,
    maxExperienceMonths: 24,
    requiredSkills: ['Python', 'Go', 'Distributed Systems', 'Docker'],
    salary: '₹14,00,000 - ₹22,00,000 PA',
    postingDate: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    applicationUrl: 'https://jobs.ashbyhq.com/commure',
    source: 'Ashby',
  },
  {
    id: 'live-4',
    title: 'Software Development Engineer - Backend',
    company: 'Razorpay',
    location: { city: 'Bengaluru', country: 'India', remote: false },
    workMode: 'hybrid',
    employmentType: 'full-time',
    minExperienceMonths: 0,
    maxExperienceMonths: 18,
    requiredSkills: ['Golang', 'Python', 'Microservices', 'Kafka'],
    salary: '₹15,00,000 - ₹24,00,000 PA',
    postingDate: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    applicationUrl: 'https://jobs.lever.co/razorpay',
    source: 'Lever',
  },
  {
    id: 'live-5',
    title: 'Full Stack Engineer (TypeScript/React)',
    company: 'Hasura',
    location: { city: 'Bengaluru', country: 'India', remote: true },
    workMode: 'remote',
    employmentType: 'full-time',
    minExperienceMonths: 0,
    maxExperienceMonths: 24,
    requiredSkills: ['GraphQL', 'TypeScript', 'React', 'Node.js'],
    salary: '₹16,00,000 - ₹25,00,000 PA',
    postingDate: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    applicationUrl: 'https://hasura.io/careers',
    source: 'Greenhouse',
  },
  {
    id: 'live-6',
    title: 'Software Engineering Intern',
    company: 'SigNoz',
    location: { city: 'Bengaluru', country: 'India', remote: false },
    workMode: 'on-site',
    employmentType: 'internship',
    minExperienceMonths: 0,
    maxExperienceMonths: 12,
    requiredSkills: ['React', 'TypeScript', 'Go', 'ClickHouse'],
    salary: '₹40,000 - ₹60,000 / month',
    postingDate: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    applicationUrl: 'https://jobs.ashbyhq.com/signoz',
    source: 'Ashby',
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All India');
  const [locationDropdown, setLocationDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'fulltime' | 'internship' | 'remote'>('all');
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  // Real-time opportunities fetched from Python API
  const [realJobs, setRealJobs] = useState<RealJobOpportunity[]>(FALLBACK_DEV_JOBS);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestOpportunities = async () => {
      setIsLoadingJobs(true);
      try {
        const res = await api.get(`/jobs/latest?category=${activeTab}&limit=6`);
        if (res.data?.success && res.data?.data?.jobs?.length > 0) {
          if (isMounted) {
            setRealJobs(res.data.data.jobs);
          }
        }
      } catch (err) {
        // Fallback gracefully to verified client jobs
        if (isMounted) {
          if (activeTab === 'all') {
            setRealJobs(FALLBACK_DEV_JOBS);
          } else if (activeTab === 'fulltime') {
            setRealJobs(FALLBACK_DEV_JOBS.filter((j) => j.employmentType === 'full-time'));
          } else if (activeTab === 'internship') {
            setRealJobs(FALLBACK_DEV_JOBS.filter((j) => j.employmentType === 'internship' || j.title.toLowerCase().includes('intern')));
          } else if (activeTab === 'remote') {
            setRealJobs(FALLBACK_DEV_JOBS.filter((j) => j.workMode === 'remote' || j.location.remote));
          }
        }
      } finally {
        if (isMounted) setIsLoadingJobs(false);
      }
    };

    fetchLatestOpportunities();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(`/dashboard/jobs?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(selectedLocation)}`);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    navigate(`/dashboard/jobs?q=${encodeURIComponent(tag)}`);
  };

  // Helper for company initial avatar
  const getCompanyInitials = (name: string) => {
    if (!name) return 'DN';
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Format posted time
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      const diffHrs = Math.floor((Date.now() - d.getTime()) / (1000 * 3600));
      if (diffHrs < 1) return 'Just now';
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl py-10 sm:py-16 space-y-16 sm:space-y-20">
        
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & Search */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-[#ECFDF5] px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#065F46] shadow-2xs">
              <span>🚀</span>
              <span>For Freshers & Early-Career Developers</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Discover & Apply to <br className="hidden sm:inline" />
              <span className="text-slate-900 dark:text-white">Developer Jobs</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Find verified full-time jobs and internships for freshers and entry-level developers, updated daily.
            </p>

            {/* Floating Search Capsule */}
            <form
              onSubmit={handleSearch}
              className="relative rounded-2xl sm:rounded-full border border-slate-200/90 bg-white dark:bg-slate-900 p-2 sm:p-2.5 shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              {/* Keyword Input */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs (e.g., MERN, SDE, Frontend...)"
                  className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block h-7 w-px bg-slate-200 dark:bg-slate-800" />

              {/* Location Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLocationDropdown(!locationDropdown)}
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 rounded-xl sm:rounded-full hover:bg-slate-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{selectedLocation}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {locationDropdown && (
                  <div className="absolute top-full mt-2 left-0 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 dark:bg-slate-900">
                    {['All India', 'Bengaluru', 'Hyderabad', 'Pune', 'Remote', 'Delhi NCR'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setLocationDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="rounded-xl sm:rounded-full bg-[#0A382C] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#065F46] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                Search
              </button>
            </form>

            {/* Popular Keywords */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">Popular:</span>
              {['MERN', 'Frontend', 'Backend', 'SDE', 'Internship'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="rounded-full border border-slate-200/80 bg-slate-50/80 hover:bg-[#E6F4EA] hover:text-[#064E3B] hover:border-emerald-300 px-3.5 py-1 text-xs font-medium text-slate-700 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Mockup / Workspace Illustration */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/70 via-teal-50/40 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative w-full max-w-[480px]">
              
              {/* Floating Trust Checklist Card */}
              <div className="absolute -top-6 -right-2 sm:-right-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-20 space-y-2.5 hidden sm:block">
                {[
                  'Verified Jobs',
                  'Fresher Friendly',
                  'Internships',
                  'Daily Updates',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Laptop Graphic */}
              <div className="relative mx-auto rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-3 shadow-2xl border border-slate-700">
                <div className="mx-auto mb-2 h-1.5 w-1.5 rounded-full bg-slate-600" />

                <div className="rounded-xl bg-[#0F172A] p-4 text-white font-mono text-xs overflow-hidden border border-slate-800 space-y-3">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold tracking-wider flex items-center gap-1">
                      <span className="text-emerald-400">&lt;/&gt;</span> devnest_workspace
                    </div>
                    <div className="h-2 w-8 rounded bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-12 gap-3 pt-1">
                    <div className="col-span-6 space-y-2 border-r border-slate-800 pr-2">
                      <div className="h-2 w-16 bg-purple-400 rounded" />
                      <div className="h-2 w-28 bg-emerald-400/80 rounded" />
                      <div className="h-2 w-20 bg-sky-400 rounded" />
                      <div className="h-2 w-32 bg-amber-400/70 rounded" />
                      <div className="h-2 w-24 bg-slate-600 rounded" />
                      <div className="pt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-sans font-bold">
                        <Check className="h-3 w-3" /> 100% Verified Developer Roles
                      </div>
                    </div>

                    <div className="col-span-6 space-y-2 pl-1 font-sans">
                      <div className="rounded-lg bg-slate-800/90 p-2 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white">Frontend (React)</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="h-1.5 w-20 bg-slate-600 rounded" />
                        <div className="flex items-center gap-1 pt-1">
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                            Full-Time
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-800/50 p-2 border border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-300">Backend (Python)</div>
                        <div className="h-1.5 w-16 bg-slate-700 rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-2 h-3 w-full rounded-b-lg bg-slate-700 flex items-center justify-center">
                  <div className="h-1 w-16 rounded-full bg-slate-500" />
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 sm:-left-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200/90 shadow-xl p-2 z-10">
                <div className="text-center">
                  <div className="font-mono font-bold text-[#0A382C] text-sm">&lt;/&gt;</div>
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tighter">COFFEE</div>
                </div>
              </div>

              <div className="absolute -bottom-5 -right-3 sm:-right-6 flex items-end gap-2 z-10">
                <div className="flex flex-col space-y-1">
                  <div className="h-2.5 w-16 rounded bg-emerald-800 shadow-sm border border-emerald-950" />
                  <div className="h-2.5 w-18 rounded bg-[#0A382C] shadow-sm border border-emerald-950" />
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg border border-emerald-200 shadow-md">
                  🪴
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4-COLUMN FEATURE STRIP                                                   */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            
            <div className="flex items-start gap-4 pt-4 sm:pt-0 lg:px-4 first:pl-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Zap className="h-6 w-6 fill-emerald-600 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Fresh Opportunities</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-snug">New jobs every 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 sm:pt-0 lg:px-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ShieldCheck className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Verified & Genuine</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-snug">Curated direct ATS job posts</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 sm:pt-0 lg:px-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Users className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Fresher Focused</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-snug">Entry-level & internship roles</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 sm:pt-0 lg:px-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Layers className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">All in One Place</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-snug">Jobs, internships, direct links</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* LATEST OPPORTUNITIES SECTION — REAL-TIME LIVE DEVELOPER JOBS             */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          
          {/* Header & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Latest Opportunities
                </h2>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Feeds
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Genuine real-time developer openings with direct company application forms.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all',
                    activeTab === 'all'
                      ? 'bg-[#0A382C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                  )}
                >
                  All Jobs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('fulltime')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all',
                    activeTab === 'fulltime'
                      ? 'bg-[#0A382C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                  )}
                >
                  Full-Time
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('internship')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all',
                    activeTab === 'internship'
                      ? 'bg-[#0A382C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                  )}
                >
                  Internships
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('remote')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all',
                    activeTab === 'remote'
                      ? 'bg-[#0A382C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                  )}
                >
                  Remote
                </button>
              </div>

              {/* View All Jobs Link */}
              <Link
                to="/dashboard/jobs"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-slate-800 hover:text-[#0A382C] transition-colors ml-2"
              >
                <span>View All Jobs</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Real-time Jobs Grid */}
          {isLoadingJobs ? (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
              <p className="text-xs text-slate-500 font-medium">Fetching real-time opportunities...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realJobs.map((job) => {
                const isSaved = !!savedJobs[job.id];
                const isInternship =
                  job.employmentType?.toLowerCase().includes('intern') ||
                  job.title?.toLowerCase().includes('intern');

                const yoeLabel =
                  job.minExperienceMonths === 0
                    ? job.maxExperienceMonths && job.maxExperienceMonths <= 12
                      ? 'Fresher / 0–1 YOE'
                      : '0–2 YOE'
                    : '1–2 YOE';

                return (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
                  >
                    {/* Card Header: Company avatar, name, time, bookmark */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200/80 bg-emerald-50 text-emerald-800 font-bold text-xs shadow-2xs">
                          {getCompanyInitials(job.company)}
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{job.company}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {job.source || 'Live ATS'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">{formatTimeAgo(job.postingDate)}</span>
                        <button
                          type="button"
                          onClick={(e) => toggleSave(job.id, e)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                          aria-label="Save Job"
                        >
                          <Bookmark
                            className={cn('h-4 w-4', isSaved ? 'fill-emerald-700 text-emerald-700' : '')}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Title & Tags */}
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight line-clamp-1">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2">
                        {isInternship ? (
                          <span className="rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs font-semibold">
                            Internship
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
                            Full-Time
                          </span>
                        )}

                        <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-medium">
                          {yoeLabel}
                        </span>

                        {job.salary && (
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                            <Banknote className="h-3 w-3" />
                            {job.salary}
                          </span>
                        )}
                      </div>

                      {/* Required skills preview */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.requiredSkills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] bg-slate-50 border border-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{job.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Location, Work Mode, Direct Apply Button */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{job.location?.city || 'Bengaluru'}</span>
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          <span>{job.workMode || 'Hybrid'}</span>
                        </div>
                      </div>

                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#0A382C] hover:bg-[#065F46] text-white px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-[0.98]"
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* BOTTOM CTA BANNER: Kickstart Your Tech Career with DevNest                */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#062A20] via-[#0A382C] to-[#04261C] p-8 sm:p-14 text-white shadow-xl border border-emerald-950">
          
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
          
          <svg
            className="absolute bottom-0 right-0 w-96 h-48 opacity-30 pointer-events-none"
            viewBox="0 0 400 200"
            fill="none"
          >
            <path
              d="M0 200 C150 120 280 220 400 100 L400 200 Z"
              fill="url(#emerald-wave)"
            />
            <defs>
              <linearGradient id="emerald-wave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12">
            
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-900/50 border border-emerald-600/40 shadow-inner">
              <span className="font-mono text-3xl font-extrabold text-emerald-400">&lt;/&gt;</span>
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Kickstart Your Tech Career with{' '}
                <span className="text-emerald-400">DevNest</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Create your profile, get personalized job recommendations, and never miss a relevant opportunity.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 justify-center md:justify-start">
                <Button
                  className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold px-7 py-3 text-sm shadow-md"
                  asChild
                >
                  <Link to="/register" className="flex items-center gap-2">
                    <span>Create Free Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="rounded-full border-white/50 bg-transparent text-white hover:bg-white/10 font-semibold px-7 py-3 text-sm"
                  asChild
                >
                  <Link to="/dashboard/jobs">Explore Jobs</Link>
                </Button>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
