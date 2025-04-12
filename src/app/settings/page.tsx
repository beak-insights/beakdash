import { Metadata } from 'next';
import SettingsPage from '@/components/pages/settings-page';

// Define metadata for the settings page
export const metadata: Metadata = {
  title: 'BeakDash - Settings',
  description: 'Manage your application settings and preferences',
};

// Settings page component
export default function Settings() {
  return <SettingsPage />;
}