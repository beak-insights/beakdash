'use client';

import { useMemo } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  username?: string;
  displayName?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  displayName?: string;
  email?: string;
}

/**
 * Hook for authentication operations using NextAuth
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Derive user from session
  const user: AuthUser | null = useMemo(() => {
    if (!session?.user) return null;
    return session.user as AuthUser;
  }, [session]);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !!user;
  }, [user]);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error('Login error:', result.error);
        throw new Error(result.error);
      }

      // Redirect after successful login
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Register function - uses the API route
  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // After registration, log the user in
      await login(registerData.username, registerData.password);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: status === 'loading',
    login,
    register,
    logout,
  };
}