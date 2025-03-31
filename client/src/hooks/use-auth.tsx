import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
};

type ProfileUpdate = {
  displayName?: string;
  email?: string;
  theme?: string;
  language?: string;
  timeZone?: string;
  avatarUrl?: string;
  settings?: Record<string, any>;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  updateProfileMutation: UseMutationResult<User, Error, { id: number; data: ProfileUpdate }>;
  updateSettingsMutation: UseMutationResult<Record<string, any>, Error, { id: number; settings: Record<string, any> }>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Fetch current user data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) return null;
      
      try {
        const res = await fetch(`/api/user/profile/${storedUserId}`);
        if (!res.ok) {
          if (res.status === 404) {
            localStorage.removeItem("userId");
            return null;
          }
          throw new Error("Failed to fetch user profile");
        }
        return await res.json();
      } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
      }
    },
    staleTime: 300000, // 5 minutes - keep data fresh for longer
    gcTime: 3600000, // 1 hour - keep in cache longer (formerly cacheTime in v4)
    refetchOnWindowFocus: false, // Prevent refetching when window gets focus
    refetchOnMount: false // Prevent refetching when component mounts
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (userData: User) => {
      localStorage.setItem("userId", userData.id.toString());
      queryClient.setQueryData(["currentUser"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.displayName || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (userData: User) => {
      localStorage.setItem("userId", userData.id.toString());
      queryClient.setQueryData(["currentUser"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.displayName || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("userId");
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfileUpdate }) => {
      const res = await apiRequest("PUT", `/api/user/profile/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Profile update failed");
      }
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["currentUser"], userData);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ id, settings }: { id: number; settings: Record<string, any> }) => {
      const res = await apiRequest("PUT", `/api/user/settings/${id}`, settings);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Settings update failed");
      }
      return await res.json();
    },
    onSuccess: (settings: Record<string, any>) => {
      // Update the user object with the new settings
      if (user) {
        queryClient.setQueryData(["currentUser"], {
          ...user,
          settings
        });
      }
      toast({
        title: "Settings updated",
        description: "Your settings have been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Settings update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create a properly typed user value to avoid type errors
  const typedUser = user as User | null;
  
  return (
    <AuthContext.Provider
      value={{
        user: typedUser,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
        updateProfileMutation,
        updateSettingsMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}