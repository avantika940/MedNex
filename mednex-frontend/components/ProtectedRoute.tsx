/**
 * Protected Route Component
 * 
 * Wrapper component that ensures user is authenticated before accessing protected pages.
 * Redirects to login if user is not authenticated.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('User not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }

      // If admin access required, check role
      if (requireAdmin) {
        const user = getCurrentUser();
        if (user?.role !== 'admin') {
          console.log('Admin access required, redirecting...');
          router.push('/');
          return;
        }
      }

      // User is authorized
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requireAdmin]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthorized) {
    return null;
  }

  // User is authorized, render the protected content
  return <>{children}</>;
}
