import { Metadata } from 'next';
import SettingsPage from '@/components/pages/settings-page';

export const metadata: Metadata = {
  title: 'Settings - AI Dashboard Creator',
  description: 'Configure your application settings',
};

export default function Settings() {
  return <SettingsPage />;
}