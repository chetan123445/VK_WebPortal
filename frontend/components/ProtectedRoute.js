"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isTokenExpired, getToken, logout } from '../utils/auth.js';
import { BASE_API_URL } from '../pages/apiurl.js';

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists and is not expired
        if (!isAuthenticated() || isTokenExpired(getToken())) {
          logout();
          router.push('/login');
          return;
        }

        // Verify token with backend
        const response = await fetch(`${BASE_API_URL}/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsValid(true);
        } else {
          // Token is invalid, logout and redirect
          logout();
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#1e3c72'
      }}>
        Loading...
      </div>
    );
  }

  if (!isValid) {
    return null; // Will redirect to login
  }

  return children;
} 