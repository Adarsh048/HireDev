import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account & Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your credentials, automated refresh notification alerts, and data privacy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
          <CardDescription>Your registered identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input defaultValue={user?.name || ''} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button size="sm">Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opportunity Notifications</CardTitle>
          <CardDescription>
            Control daily 24-hour cycle alerts for freshly scraped Indian openings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Daily Refresh Alert</div>
              <div className="text-xs text-muted-foreground">
                Get notified when the daily top 10 rankings are generated.
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">High Match Instant Ping</div>
              <div className="text-xs text-muted-foreground">
                Notify when a &gt;90% match role is discovered.
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your profile and parsed resume vectors</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Once deleted, all application histories and recommendations are removed.
          </p>
          <Button variant="destructive" size="sm" onClick={() => logout()}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

