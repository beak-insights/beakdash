import { Metadata } from 'next';
import ConnectionsPage from '@/components/pages/connections-page';

export const metadata: Metadata = {
  title: 'Connections - AI Dashboard Creator',
  description: 'Manage your data connections',
};

export default function Connections() {
  return <ConnectionsPage />;
}