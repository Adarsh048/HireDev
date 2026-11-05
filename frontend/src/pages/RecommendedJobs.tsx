import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JobCard } from '@/components/JobCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRecommendedJobs, useJobsByPlatform } from '@/hooks/useJobs';
import { Briefcase, Upload, Sparkles, ShieldCheck } from 'lucide-react';

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

  const { data: allData, isLoading: allLoading } = useRecommendedJobs(1, 60);
  const { data: platformData, isLoading: platformLoading } = useJobsByPlatform(
    activeTab !== 'all' ? activeTab : '',
  );

  const isLoading = activeTab === 'all' ? allLoading : platformLoading;
  const rawList =
    activeTab === 'all'
      ? allData?.data?.recommendations || []
      : platformData?.recommendations || [];

  const list = minScoreFilter > 0 
    ? rawList.filter((r) => r.matchScore >= minScoreFilter)
    : rawList;

  const totalRecommendations = allData?.pagination?.total ?? 0;
  const hasRecommendations = totalRecommendations > 0;

  if (allLoading) {
    return <LoadingSpinner text="Fetching verified Indian opportunities..." />;
  }

  if (!hasRecommendations) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalized Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-matched technical roles across LinkedIn, Naukri, Indeed, Internshala, Foundit, and Wellfound.
          </p>
        </div>

        <Card className="border-dashed border-2 border-border/80 bg-card/60 p-12 text-center flex flex-col items-center justify-center rounded-2xl max-w-2xl mx-auto space-y-5 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-foreground">Upload Resume to View Recommendations</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We only show jobs that are strictly relevant to your tech stack and graduation year. Upload your resume (PDF or DOCX) to instantly unlock 10 top-matched, verified jobs per platform (60 total active Indian tech openings).
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button asChild size="default" className="gap-2 shadow-sm px-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Top Ranked Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All opportunities calibrated with high-confidence AI match scores (80%+). 10 genuine openings per platform (60 total).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMinScoreFilter(0)}
              className={`px-3 py-1 rounded-md transition-all ${
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
              className={`px-3 py-1 rounded-md transition-all ${
                minScoreFilter === 90
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🔥 Top Tier (90%+)
            </button>
          </div>

          <Button variant="outline" asChild size="sm">
            <Link to="/upload" className="gap-1.5">
              <Upload className="h-4 w-4" /> Re-scan Resume
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60 rounded-xl border border-border/50">
          {PLATFORMS.map((p) => {
            const count =
              p.id === 'all'
                ? totalRecommendations
                : (allData?.data?.recommendations || []).filter((r) => r.platform === p.id).length || 10;

            return (
              <TabsTrigger
                key={p.id}
                value={p.id}
                className="text-xs px-3.5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                {p.label}
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-semibold">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <LoadingSpinner text="Fetching verified Indian opportunities..." />
          ) : list.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={`No vacancies found for ${activeTab}`}
              description="Please select 'All Sources' to view all openings."
              actionText="View All Sources"
              onAction={() => setActiveTab('all')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((rec, i) => (
                <JobCard
                  key={rec.id || (rec as any)._id || (rec.job as any)?._id || i}
                  job={rec.job}
                  recommendation={rec.matchScore > 0 ? rec : undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
