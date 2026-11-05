import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-card border border-indigo-200 dark:border-indigo-900/50 p-2 shadow-md shadow-indigo-500/10">
            <img src="/logo.png" alt="DevLaunch" className="h-full w-full object-contain" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Welcome to DevLaunch</CardTitle>
        <CardDescription>Enter your email and password to access your recommendations</CardDescription>
      </CardHeader>

      <div className="px-6 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            setEmail('test@nexhire.in');
            setPassword('Password123!');
            try {
              await login({ email: 'test@nexhire.in', password: 'Password123!' });
              navigate('/dashboard');
            } catch (err: any) {
              const msg =
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                err.message ||
                'Demo login failed';
              setError(msg);
            }
          }}
          disabled={isLoggingIn}
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 font-semibold gap-2 py-5"
        >
          <Sparkles className="h-4 w-4" /> ⚡ One-Click Test / Demo Mode
        </Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or sign in with credentials</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

