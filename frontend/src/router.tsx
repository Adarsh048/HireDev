import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ResumeUpload } from '@/pages/ResumeUpload';
import { ResumeReview } from '@/pages/ResumeReview';
import { Preferences } from '@/pages/Preferences';
import { Dashboard } from '@/pages/Dashboard';
import { RecommendedJobs } from '@/pages/RecommendedJobs';
import { JobDetails } from '@/pages/JobDetails';
import { SavedJobs } from '@/pages/SavedJobs';
import { Applications } from '@/pages/Applications';
import { SkillAnalysis } from '@/pages/SkillAnalysis';
import { CompanyIntelligence } from '@/pages/CompanyIntelligence';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import { useAuthStore } from '@/stores/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  const token = localStorage.getItem('accessToken');

  if (isLoading) {
    return <div className="p-8 text-center text-sm">Verifying session...</div>;
  }

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Landing /> },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
        ],
      },
      {
        path: 'upload',
        element: (
          <ProtectedRoute>
            <ResumeUpload />
          </ProtectedRoute>
        ),
      },
      {
        path: 'review',
        element: (
          <ProtectedRoute>
            <ResumeReview />
          </ProtectedRoute>
        ),
      },
      {
        path: 'preferences',
        element: (
          <ProtectedRoute>
            <Preferences />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'jobs', element: <RecommendedJobs /> },
          { path: 'jobs/:id', element: <JobDetails /> },
          { path: 'saved', element: <SavedJobs /> },
          { path: 'applications', element: <Applications /> },
          { path: 'skills', element: <SkillAnalysis /> },
          { path: 'companies', element: <CompanyIntelligence /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

