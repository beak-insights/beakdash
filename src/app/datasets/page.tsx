import { Metadata } from 'next';
import DatasetsPage from '@/components/pages/datasets-page';

// Define metadata for the datasets page
export const metadata: Metadata = {
  title: 'BeakDash - Datasets',
  description: 'Manage your datasets for visualization and analytics',
};

// Datasets page component
export default function Datasets() {
  return <DatasetsPage />;
}