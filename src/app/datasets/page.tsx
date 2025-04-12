import { Metadata } from 'next';
import DatasetsPage from '@/components/pages/datasets-page';

export const metadata: Metadata = {
  title: 'Datasets - AI Dashboard Creator',
  description: 'View and manage your datasets',
};

export default function Datasets() {
  return <DatasetsPage />;
}