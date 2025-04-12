import { Metadata } from 'next';
import ProfilePage from '@/components/pages/profile-page';

// Define metadata for the profile page
export const metadata: Metadata = {
  title: 'BeakDash - User Profile',
  description: 'View and edit your user profile settings',
};

// Profile page component
export default function Profile() {
  return <ProfilePage />;
}