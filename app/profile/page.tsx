import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { ProfileClient } from './profile-client';

export const metadata: Metadata = {
  title: 'BeakDash - Profile',
  description: 'Manage your user profile',
};

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileClient />
    </AppLayout>
  );
}