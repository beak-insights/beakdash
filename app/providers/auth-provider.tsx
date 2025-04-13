"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { get, post } from '@/lib/api';
import { AuthUser } from '@/lib/hooks/use-auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (username: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<AuthUser>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Update user data from session
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }
    
    if (session && session.user) {
      setUser(session.user as AuthUser);
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, [session, status]);

  // Fetch additional user data if needed
  useEffect(() => {
    const fetchExtendedUserData = async () => {
      if (!session?.user) return;

      try {
        const userData = await get<AuthUser>('/api/auth/me');
        setUser(userData);
      } catch (err) {
        console.error('Error fetching extended user data:', err);
      }
    };

    if (session?.user) {
      fetchExtendedUserData();
    }
  }, [session]);

  // Login handler
  const login = async (username: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Refresh user data after login
      const userData = await get<AuthUser>('/api/auth/me');
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (username: string, email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create user account
      await post('/api/auth/register', { username, email, password });
      
      // Log in the newly created user
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Fetch user data
      const userData = await get<AuthUser>('/api/auth/me');
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut({ redirect: false });
      setUser(null);
      router.push('/auth');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile handler
  const updateProfile = async (data: Partial<AuthUser>): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await post<AuthUser>('/api/user/profile', data);
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading: isLoading || status === 'loading',
    login,
    register,
    logout,
    updateProfile,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};