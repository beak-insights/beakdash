import { Metadata } from 'next';
import ProfilePage from '@/components/pages/profile-page';

export const metadata: Metadata = {
  title: 'Profile - AI Dashboard Creator',
  description: 'Manage your user profile',
};

export default function Profile() {
  return <ProfilePage />;
}