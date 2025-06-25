import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from './auth';

export default function useAuthRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Remove all sensitive data on mount if not authenticated
    if (!getToken()) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        // Replace current history entry so back button can't return to protected page
        window.location.href = '/login'; // Use href for a full reload and history reset
      }
    } else {
      // Listen for browser back/forward navigation
      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && !getToken()) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      return () => document.removeEventListener('visibilitychange', handleVisibility);
    }
  }, [router]);
}
