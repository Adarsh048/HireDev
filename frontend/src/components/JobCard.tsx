import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Bookmark, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchScoreBadge } from './MatchScoreBadge';
import { PlatformBadge } from './PlatformBadge';
import { SkillBadge } from './SkillBadge';
import { JobPosting, Recommendation } from '@/types';
import { useToggleSaveJob } from '@/hooks/useJobs';

interface JobCardProps {
  job: JobPosting;
  recommendation?: Recommendation;
  isSaved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, recommendation, isSaved = false }) => {
  const toggleSave = useToggleSaveJob();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ jobId: job.id });
  };

  return (
    <Card className="hover:border-primary/50 transition-all hover:shadow-md duration-200 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <PlatformBadge platform={job.source} />
              <Badge variant="secondary" className="capitalize text-xs">
                {job.workMode}
              </Badge>
              {job.employmentType && (
                <Badge variant="outline" className="text-xs">
                  {job.employmentType}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold leading-tight hover:text-primary transition-colors">
              <Link to={`/dashboard/jobs/${job.id}`}>{job.title}</Link>
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Building2 className="h-4 w-4" /> {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {job.location.city || 'India'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {recommendation && <MatchScoreBadge score={recommendation.matchScore} />}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="text-muted-foreground hover:text-foreground rounded-full h-8 w-8"
              aria-label="Save Job"
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Matched skills */}
        {recommendation?.matchedSkills && recommendation.matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recommendation.matchedSkills.slice(0, 5).map((skill) => (
              <SkillBadge key={skill} name={skill} matched={true} />
            ))}
            {recommendation.matchedSkills.length > 5 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{recommendation.matchedSkills.length - 5} more
              </Badge>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between border-t text-xs text-muted-foreground py-3">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {job.postingDate ? new Date(job.postingDate).toLocaleDateString() : 'Recently posted'}
        </span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link to={`/dashboard/jobs/${job.id}`}>View Details</Link>
          </Button>
          <Button size="sm" asChild className="h-8 text-xs gap-1">
            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
              Apply Direct <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

