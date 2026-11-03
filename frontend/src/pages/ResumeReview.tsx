import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Edit2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProfile, useUpdateProfile } from '@/hooks/useResume';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const ResumeReview: React.FC = () => {
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: [] as string[],
    newSkill: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        skills: profile.skills || [],
        newSkill: '',
      });
    }
  }, [profile]);

  if (isLoading) {
    return <LoadingSpinner text="Retrieving your extracted candidate profile..." />;
  }

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!formData.newSkill.trim()) return;

    if (!formData.skills.includes(formData.newSkill.trim().toLowerCase())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim().toLowerCase()],
        newSkill: '',
      });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSave = async () => {
    await updateProfile({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      skills: formData.skills,
    });
    navigate('/preferences');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Extracted Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review the AI-extracted details. You can adjust and add skills to guarantee accurate job matching.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
          <CardDescription>Verified from your resume header</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technical Skills & Taxonomy</CardTitle>
          <CardDescription>
            These skills drive your 30% skills compatibility weight in matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add skill (e.g., Docker, TypeScript, FastApi)..."
              value={formData.newSkill}
              onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
              onKeyDown={handleAddSkill}
            />
            <Button type="button" onClick={handleAddSkill} variant="secondary" className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-destructive transition-colors ml-1"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education & Experience preview */}
      {profile?.education && profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Education & Batch Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-muted/20 text-xs">
                <div>
                  <div className="font-semibold text-foreground text-sm">{edu.degree}</div>
                  <div className="text-muted-foreground">{edu.institution || 'Recognized Institute'}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{edu.graduationYear || 'Batch N/A'}</Badge>
                  {edu.cgpa && <div className="text-muted-foreground mt-1">CGPA: {edu.cgpa}</div>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={() => navigate('/upload')}>
          Back to Upload
        </Button>
        <Button onClick={handleSave} disabled={isPending} className="gap-2">
          Confirm Profile & Preferences <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

