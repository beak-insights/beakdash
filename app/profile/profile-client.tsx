'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';

interface ProfileData {
  username: string;
  email: string;
  displayName: string;
  bio: string;
  createdAt: string;
  stats: {
    dashboards: number;
    connections: number;
    datasets: number;
  };
}

const initialProfileData: ProfileData = {
  username: '',
  email: '',
  displayName: '',
  bio: '',
  createdAt: '',
  stats: {
    dashboards: 0,
    connections: 0,
    datasets: 0
  }
};

export function ProfileClient() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch profile data');
        const data = await response.json();
        setProfileData({
          ...data,
          displayName: data.displayName || data.username, // Use username as fallback for displayName
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchProfileData();
  }, [toast]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: profileData.displayName || profileData.username, // Ensure we always send a displayName
          bio: profileData.bio,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // Update session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profileData.displayName || profileData.username,
        },
      });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const currentPassword = form['current-password'].value;
    const newPassword = form['new-password'].value;
    const confirmPassword = form['confirm-password'].value;

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to update password');

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });

      // Clear password fields
      form.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Header title="Profile" description="">
        <button
          onClick={handleProfileUpdate}
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </Header>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - User info */}
        <div className="col-span-2 space-y-6">
          <form onSubmit={handleProfileUpdate} className="border rounded-lg p-6 bg-card space-y-4">
            <h2 className="text-lg font-medium">Account Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="displayName" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Full Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="username" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={profileData.username}
                    disabled
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="bio" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </form>

          <form onSubmit={handlePasswordChange} className="border rounded-lg p-6 bg-card space-y-4">
            <h2 className="text-lg font-medium">Change Password</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="current-password" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="new-password" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={8}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="confirm-password" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={8}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column - Profile image and stats */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 bg-card flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              {profileData?.displayName?.slice(0, 2).toUpperCase() || 
               profileData?.username?.slice(0, 2).toUpperCase() || 
               '??'}
            </div>
            <h3 className="text-lg font-medium">{profileData?.displayName || profileData?.username || 'User'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Member since {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
            </p>
            <button
              disabled={isLoading}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium w-full disabled:opacity-50"
            >
              Upload Picture
            </button>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-medium mb-4">Account Stats</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dashboards</span>
                <span className="font-medium">{profileData.stats.dashboards}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Connections</span>
                <span className="font-medium">{profileData.stats.connections}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Datasets</span>
                <span className="font-medium">{profileData.stats.datasets}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 