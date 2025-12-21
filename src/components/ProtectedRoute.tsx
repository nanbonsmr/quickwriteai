import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isSignedIn } = useAuth();
  const location = useLocation();

  // Check if we're in the middle of an OAuth callback (has code param)
  const searchParams = new URLSearchParams(location.search);
  const hasAuthCallback = searchParams.has('code') || searchParams.has('state');

  console.log('[ProtectedRoute] State:', { loading, isSignedIn, hasAuthCallback, path: location.pathname, search: location.search });

  // Show loading while auth is being processed OR if we have OAuth callback params
  if (loading || hasAuthCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            {hasAuthCallback ? 'Completing sign in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    console.log('[ProtectedRoute] Not signed in, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
