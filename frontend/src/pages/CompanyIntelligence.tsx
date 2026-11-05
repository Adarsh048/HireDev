import React from 'react';
import { Building2, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const VERIFIED_HIRING_COMPANIES = [
  {
    name: 'Zomato',
    location: 'Gurugram / Remote',
    domain: 'Consumer Tech',
    openings: 8,
    roles: ['Backend Engineer (Go)', 'Frontend Developer (React)', 'Full Stack Developer'],
  },
  {
    name: 'Swiggy',
    location: 'Bengaluru',
    domain: 'E-commerce & Logistics',
    openings: 12,
    roles: ['Software Development Engineer I', 'Mobile Engineer (Android)', 'Backend Engineer (Java)'],
  },
  {
    name: 'Razorpay',
    location: 'Bengaluru',
    domain: 'FinTech',
    openings: 10,
    roles: ['Full Stack Engineer', 'Python / Django Engineer', 'API / Backend Engineer'],
  },
  {
    name: 'PhonePe',
    location: 'Bengaluru / Pune',
    domain: 'Payments Infrastructure',
    openings: 14,
    roles: ['Software Engineer - Distributed Systems', 'Frontend Engineer (React)', 'Mobile Developer (React Native)'],
  },
  {
    name: 'Postman',
    location: 'Bengaluru / Remote',
    domain: 'Developer Tools',
    openings: 6,
    roles: ['Frontend Engineer', 'Backend Engineer (Node.js)', 'Platform API Developer'],
  },
  {
    name: 'Cred',
    location: 'Bengaluru',
    domain: 'FinTech',
    openings: 5,
    roles: ['Backend Engineer (Java/Kotlin)', 'Frontend Developer (Next.js)', 'Mobile Developer (iOS/Flutter)'],
  },
];

export const CompanyIntelligence: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Hiring Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verified Indian tech organizations actively sourcing 0–2 YOE engineers and tech graduates.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VERIFIED_HIRING_COMPANIES.map((company) => (
          <Card key={company.name} className="hover:border-primary/50 transition-colors flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {company.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {company.location}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {company.openings} verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Tech Profiles:
              </div>
              <div className="space-y-1.5">
                {company.roles.map((role) => (
                  <div key={role} className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

