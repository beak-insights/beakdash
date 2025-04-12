import { Metadata } from 'next';
import ConnectionsPage from '@/components/pages/connections-page';

// Define metadata for the connections page
export const metadata: Metadata = {
  title: 'BeakDash - Data Connections',
  description: 'Manage your data source connections for dashboards',
};

// Connections page component
export default function Connections() {
  return <ConnectionsPage />;
}