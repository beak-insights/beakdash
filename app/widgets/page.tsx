import { Metadata } from 'next';
import WidgetsPage from '@/components/pages/widgets-page';

// Define metadata for the widgets page
export const metadata: Metadata = {
  title: 'BeakDash - Dashboard Widgets',
  description: 'Manage and customize your dashboard widgets',
};

// Widgets page component
export default function Widgets() {
  return <WidgetsPage />;
}