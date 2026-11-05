import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JobCard } from '@/components/JobCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRecommendedJobs, useJobsByPlatform } from '@/hooks/useJobs';
import { Briefcase, Upload, Sparkles, Search, X } from 'lucide-react';

const PLATFORMS = [
  { id: 'all', label: 'All Sources' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'naukri', label: 'Naukri' },
  { id: 'indeed', label: 'Indeed' },
  { id: 'internshala', label: 'Internshala' },
  { id: 'foundit', label: 'Foundit' },
  { id: 'wellfound', label: 'Wellfound' },
];

export const RecommendedJobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allData, isLoading: allLoading } = useRecommendedJobs(1, 60);
  const { data: platformData, isLoading: platformLoading } = useJobsByPlatform(
    activeTab !== 'all' ? activeTab : '',
  );

  const isLoading = activeTab === 'all' ? allLoading : platformLoading;
  const rawList =
    activeTab === 'all'
      ? allData?.data?.recommendations || []
      : platformData?.recommendations || [];

  const list = useMemo(() => {
    let result = rawList;
    if (minScoreFilter > 0) {
      result = result.filter((r) => r.matchScore >= minScoreFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.job?.title?.toLowerCase().includes(q) ||
          r.job?.company?.toLowerCase().includes(q) ||
          r.job?.requiredSkills?.some((s) => s.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [rawList, minScoreFilter, searchQuery]);

  const totalRecommendations = allData?.pagination?.total ?? 0;
  const hasRecommendations = totalRecommendations > 0;

  if (allLoading) {
    return <LoadingSpinner text="Fetching verified Indian opportunities..." />;
  }

  if (!hasRecommendations) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Personalized Recommendations</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            AI-matched technical roles across LinkedIn, Naukri, Indeed, Internshala, Foundit, and Wellfound.
          </p>
        </div>

        <Card className="border-dashed border-2 border-border/80 bg-card/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center rounded-2xl max-w-2xl mx-auto space-y-5 shadow-sm">
          <div className="h-14 sm:h-16 w-14 sm:w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Sparkles className="h-7 sm:h-8 w-7 sm:w-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Upload Resume to View Recommendations</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We only show jobs that are strictly relevant to your tech stack and graduation year. Upload your resume (PDF or DOCX) to instantly unlock 10 top-matched, verified jobs per platform (60 total active Indian tech openings).
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button asChild size="default" className="w-full sm:w-auto gap-2 shadow-sm px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium">
              <Link to="/upload">
                <Upload className="h-4 w-4" /> Upload Resume Now
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Top Ranked Recommendations</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            All opportunities calibrated with high-confidence AI match scores (80%+). 10 genuine openings per platform (60 total).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40 text-xs font-medium w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setMinScoreFilter(0)}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-md transition-all ${
                minScoreFilter === 0
                  ? 'bg-background shadow-sm text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Matches (80%+)
            </button>
            <button
              type="button"
              onClick={() => setMinScoreFilter(90)}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-md transition-all ${
                minScoreFilter === 90
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🔥 Top Tier (90%+)
            </button>
          </div>

          <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
            <Link to="/upload" className="gap-1.5">
              <Upload className="h-4 w-4" /> Re-scan Resume
            </Link>
          </Button>
        </div>
      </div>

      {/* Live Search and Quick Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by job title, company name, or technology (e.g. React, SigNoz, Python)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 h-10 text-xs sm:text-sm rounded-xl border-border/80 bg-card"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Horizontally scrollable on mobile, wrap on desktop */}
        <div className="w-full overflow-hidden">
          <TabsList className="flex overflow-x-auto no-scrollbar sm:flex-wrap h-auto p-1 bg-muted/60 rounded-xl border border-border/60 gap-1 w-full max-w-full touch-pan-x">
            {PLATFORMS.map((p) => {
              const count =
                p.id === 'all'
                  ? totalRecommendations
                  : (allData?.data?.recommendations || []).filter((r) => r.platform === p.id).length || 10;

              return (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="shrink-0 whitespace-nowrap text-xs px-3.5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  {p.label}
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <LoadingSpinner text="Fetching verified Indian opportunities..." />
          ) : list.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={`No vacancies found matching your filter`}
              description="Try adjusting your search query or reset the score filter to view all verified openings."
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setMinScoreFilter(0);
                setActiveTab('all');
              }}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  Showing <strong className="text-foreground">{list.length}</strong> verified opportunities
                </span>
                {minScoreFilter > 0 && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Filtered by score \(\ge\) {minScoreFilter}%
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((rec, i) => (
                  <JobCard
                    key={rec.id || (rec as any)._id || (rec.job as any)?._id || i}
                    job={rec.job}
                    recommendation={rec.matchScore > 0 ? rec : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
