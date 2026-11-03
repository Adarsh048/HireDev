import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProfile, useUpdateProfile } from '@/hooks/useResume';

const TECH_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Data Analyst / Engineer',
  'DevOps / Cloud Trainee',
  'QA / Test Engineer',
  'Cybersecurity Analyst',
];

const INDIA_TECH_HUBS = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Delhi NCR (Gurugram / Noida)',
  'Chennai',
  'Mumbai',
  'Kolkata',
  'Remote (India)',
];

const WORK_MODES = ['remote', 'hybrid', 'on-site'];

export const Preferences: React.FC = () => {
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const navigate = useNavigate();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>(['remote', 'hybrid']);

  useEffect(() => {
    if (profile?.preferences) {
      if (profile.preferences.jobCategories) setSelectedRoles(profile.preferences.jobCategories);
      if (profile.preferences.preferredLocations) setSelectedLocations(profile.preferences.preferredLocations);
      if (profile.preferences.workMode) setSelectedWorkModes(profile.preferences.workMode);
    }
  }, [profile]);

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async () => {
    await updateProfile({
      preferences: {
        jobCategories: selectedRoles,
        preferredLocations: selectedLocations,
        workMode: selectedWorkModes,
        employmentTypes: ['full-time', 'internship'],
      },
    });
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Set Job Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Target relevant Indian locations and roles to boost your match scores.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Target Job Categories</CardTitle>
          <CardDescription>Select roles you wish to discover</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TECH_ROLES.map((role) => {
              const selected = selectedRoles.includes(role);
              return (
                <Badge
                  key={role}
                  variant={selected ? 'default' : 'outline'}
                  onClick={() => toggleSelection(role, selectedRoles, setSelectedRoles)}
                  className="cursor-pointer py-1.5 px-3 text-xs gap-1.5 transition-all"
                >
                  {selected && <Check className="h-3 w-3" />}
                  <span>{role}</span>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferred India Locations</CardTitle>
          <CardDescription>Discovery focuses exclusively on verified Indian locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INDIA_TECH_HUBS.map((loc) => {
              const selected = selectedLocations.includes(loc);
              return (
                <Badge
                  key={loc}
                  variant={selected ? 'default' : 'outline'}
                  onClick={() => toggleSelection(loc, selectedLocations, setSelectedLocations)}
                  className="cursor-pointer py-1.5 px-3 text-xs gap-1.5 transition-all"
                >
                  {selected && <Check className="h-3 w-3" />}
                  <span>{loc}</span>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {WORK_MODES.map((mode) => {
              const selected = selectedWorkModes.includes(mode);
              return (
                <Badge
                  key={mode}
                  variant={selected ? 'default' : 'outline'}
                  onClick={() => toggleSelection(mode, selectedWorkModes, setSelectedWorkModes)}
                  className="cursor-pointer py-1.5 px-3 text-xs capitalize gap-1.5 transition-all"
                >
                  {selected && <Check className="h-3 w-3" />}
                  <span>{mode}</span>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={() => navigate('/review')}>
          Back to Review
        </Button>
        <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
          Save & Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

