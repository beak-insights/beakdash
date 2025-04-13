import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/lib/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define a session user interface compatible with NextAuth
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

// Structure for login credentials
interface LoginCredentials {
  username: string;
  password: string;
}

// Structure for registration data
interface RegisterData extends LoginCredentials {
  displayName?: string;
  email?: string;
}

/**
 * Hook for authentication operations
 */
export function useAuth() {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch current user
  const { 
    data: user, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        return await apiRequest('GET', '/api/auth/me');
      } catch (error) {
        // If we get a 401 or similar, it means the user is not authenticated
        // We don't want to throw an error in this case
        if (error instanceof Error && (error as any).status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      // Custom meta property for initialization tracking
      initialized: false
    },
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  
  // Handle initialization after query completes
  useEffect(() => {
    if (user !== undefined || error) {
      setIsInitialized(true);
    }
  }, [user, error]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiRequest('POST', '/api/auth/login', credentials);
    },
    onSuccess: () => {
      refetch(); // Refetch user after login
      toast({
        title: 'Login Successful',
        description: 'You have been successfully logged in.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return apiRequest('POST', '/api/auth/register', data);
    },
    onSuccess: () => {
      refetch(); // Refetch user after registration
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Unable to create account',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      refetch(); // Refetch user after logout to clear user data
      toast({
        title: 'Logout Successful',
        description: 'You have been successfully logged out.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout Failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profile: Partial<User>) => {
      if (!user || !user.id) {
        throw new Error('You must be logged in to update your profile');
      }
      return apiRequest('PUT', `/api/user/profile/${user.id}`, profile);
    },
    onSuccess: () => {
      refetch(); // Refetch user after profile update
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      if (!user || !user.id) {
        throw new Error('You must be logged in to change your password');
      }
      return apiRequest('PUT', `/api/user/password/${user.id}`, { currentPassword, newPassword });
    },
    onSuccess: () => {
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !!user;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    login: loginMutation.mutate,
    isPendingLogin: loginMutation.isPending,
    register: registerMutation.mutate,
    isPendingRegister: registerMutation.isPending,
    logoutMutation,
    updateProfile: updateProfileMutation.mutate,
    isPendingProfileUpdate: updateProfileMutation.isPending,
    updatePassword: updatePasswordMutation.mutate,
    isPendingPasswordUpdate: updatePasswordMutation.isPending,
  };
}