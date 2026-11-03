import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JobCard } from '@/components/JobCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRecommendedJobs, useJobsByPlatform } from '@/hooks/useJobs';
import { Briefcase } from 'lucide-react';

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

  const { data: allData, isLoading: allLoading } = useRecommendedJobs(1, 30);
  const { data: platformData, isLoading: platformLoading } = useJobsByPlatform(
    activeTab !== 'all' ? activeTab : '',
  );

  const isLoading = activeTab === 'all' ? allLoading : platformLoading;
  const list =
    activeTab === 'all'
      ? allData?.data?.recommendations || []
      : platformData?.recommendations || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Ranked Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top 10 highest-matching, verified openings per job portal. Only genuine vacancies in India.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60">
          {PLATFORMS.map((p) => (
            <TabsTrigger key={p.id} value={p.id} className="text-xs px-3 py-1.5">
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <LoadingSpinner text="Fetching verified Indian opportunities..." />
          ) : list.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={`No active ${activeTab !== 'all' ? activeTab : ''} vacancies matched`}
              description="Our 24-hour scraper automatically checks back every day. Or try updating your profile skills."
              actionText="Review Skills"
              onAction={() => (window.location.href = '/review')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((rec) => (
                <JobCard key={rec.id} job={rec.job} recommendation={rec} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

