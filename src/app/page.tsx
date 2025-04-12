import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import HomePage from '@/components/pages/home-page';

// Define metadata for the home page
export const metadata: Metadata = {
  title: 'BeakDash - AI-Powered Analytics Dashboard Platform',
  description: 'Welcome to BeakDash - Create powerful data dashboards with AI assistance',
};

// Home page component
export default function Home() {
  // For most applications, we would redirect to the dashboard if authenticated
  // or show a landing page to unauthenticated users
  return <HomePage />;
}