import { Metadata } from 'next';
import WidgetsPage from '@/components/pages/widgets-page';

export const metadata: Metadata = {
  title: 'Widgets - AI Dashboard Creator',
  description: 'Explore and manage dashboard widgets',
};

export default function Widgets() {
  return <WidgetsPage />;
}