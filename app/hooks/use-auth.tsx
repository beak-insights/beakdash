'use client';

import { useSession } from 'next-auth/react';

/**
 * Custom hook to access authentication state
 * @returns Authentication state including session data and loading status
 */
export function useAuth() {
  const { data: session, status, update } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    updateSession: update,
    status,
  };
}