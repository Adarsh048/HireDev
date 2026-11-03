import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BarChart3, TrendingUp, CheckCircle, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const SkillAnalysis: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'skills'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/skills');
      return data.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Computing Indian tech market skill analytics..." />;
  }

  const topMarketSkills: Array<{ skill: string; demandCount: number; hasSkill: boolean }> =
    data?.topMarketSkills || [];
  const recommendedToLearn: Array<{ skill: string; frequency: number }> =
    data?.recommendedToLearn || [];

  const maxDemand = topMarketSkills.length > 0 ? topMarketSkills[0].demandCount : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Gap & Market Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time market analytics derived from genuine job postings in Bengaluru, Hyderabad, Pune, and NCR.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Market Skill Demand */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">In-Demand Tech Skills in India</CardTitle>
            </div>
            <CardDescription>
              Most frequently requested requirements in verified Indian postings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topMarketSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground">Synchronizing job listings...</p>
            ) : (
              topMarketSkills.slice(0, 8).map((item) => (
                <div key={item.skill} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold capitalize flex items-center gap-1.5">
                      {item.skill}
                      {item.hasSkill && (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 py-0">
                          In Your Resume
                        </Badge>
                      )}
                    </span>
                    <span className="text-muted-foreground font-mono">{item.demandCount} jobs</span>
                  </div>
                  <Progress value={(item.demandCount / maxDemand) * 100} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recommended To Learn */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Your Personalized Skill Gap</CardTitle>
            </div>
            <CardDescription>
              Skills frequently missing from jobs that otherwise match your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedToLearn.length === 0 ? (
              <div className="p-4 rounded-lg border bg-muted/20 text-xs text-muted-foreground">
                Upload your resume and generate your first batch of recommendations to reveal targeted skill-gap recommendations.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedToLearn.map((item) => (
                  <div key={item.skill} className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs">
                    <div>
                      <div className="font-semibold capitalize text-foreground">{item.skill}</div>
                      <div className="text-muted-foreground">Requested in {item.frequency} matching roles</div>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      High Impact
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

