import { Metadata } from 'next';
import DashboardListPage from '@/components/pages/dashboard-list';

// Define metadata for the dashboards page
export const metadata: Metadata = {
  title: 'BeakDash - Your Dashboards',
  description: 'View and manage your analytics dashboards',
};

// Dashboards page component
export default function Dashboards() {
  return <DashboardListPage />;
}