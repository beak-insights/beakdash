import { Metadata } from 'next';
import DashboardList from '@/components/pages/dashboard-list';

export const metadata: Metadata = {
  title: 'Dashboards - AI Dashboard Creator',
  description: 'View and manage your dashboards',
};

export default function DashboardPage() {
  return <DashboardList />;
}