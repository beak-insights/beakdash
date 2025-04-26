import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BeakDash - Settings',
  description: 'Configure your application settings',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 