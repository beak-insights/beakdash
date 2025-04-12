import { Metadata } from 'next';
import AuthPage from '@/components/pages/auth-page';

// Define metadata for the auth page
export const metadata: Metadata = {
  title: 'BeakDash - Login or Register',
  description: 'Login or create a new account to access BeakDash analytics platform',
};

// Auth page component
export default function Auth() {
  return <AuthPage />;
}