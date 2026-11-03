import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const Landing: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-8 text-center max-w-4xl space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-xs font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Strictly Verified Indian Opportunities & Multi-Portal Discovery</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Discover Tech Roles Matching Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
            Real Potential
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          NexHire AI parses your resume with NLP, monitors genuine Indian job boards every 24 hours,
          and ranks the top 10 verified opportunities per platform tailored to freshers and 0–2 YOE engineers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary font-bold shadow-md" asChild>
            <Link to="/login">
              ⚡ Explore Live Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link to="/register">Register Candidate</Link>
          </Button>
        </div>

        {/* Badges / Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 border-t text-left">
          <div>
            <div className="text-2xl font-bold">10+</div>
            <div className="text-xs text-muted-foreground mt-0.5">Integrated Sources</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-xs text-muted-foreground mt-0.5">India Only Postings</div>
          </div>
          <div>
            <div className="text-2xl font-bold">24h</div>
            <div className="text-xs text-muted-foreground mt-0.5">Automated Refresh</div>
          </div>
          <div>
            <div className="text-2xl font-bold">Top 10</div>
            <div className="text-xs text-muted-foreground mt-0.5">Ranked Per Platform</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 sm:px-8 max-w-6xl space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Engineered for High-Relevance Discovery
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            No mock jobs. No hallucinations. Only verified Indian listings linked directly to genuine application forms.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Semantic Profile Intelligence</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PyMuPDF and spaCy extract your verified technical stack, projects, CGPA, and degree without inventing details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Hybrid Relevance Scoring</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculates similarity via MiniLM sentence transformers, graduation batch verification, and skill coverage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Mandatory Eligibility Checks</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mandatory criteria overrides skill scores so you never waste time applying to mismatched experience bands.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Multi-Platform De-duplication</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consolidates duplicates across LinkedIn, Naukri, Foundit, and direct career sites into canonical listings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Indian Tech Skill-Gap Insights</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Identifies missing high-frequency keywords across active recruiter openings to prioritize learning.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">24-Hour Automated Refresh</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                BullMQ background queues re-scan active openings every day, keeping your personalized recommendations fresh.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-8 max-w-4xl text-center space-y-6 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border p-12">
        <h2 className="text-3xl font-bold tracking-tight">Ready to Find Verified Opportunities in India?</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Upload your resume in PDF or DOCX format to receive your first ranked batch of genuine tech roles.
        </p>
        <Button size="lg" asChild className="gap-2">
          <Link to="/register">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
};

