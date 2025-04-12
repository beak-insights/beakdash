import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import HomePage from '@/components/pages/home-page';

export const metadata: Metadata = {
  title: 'Home - AI Dashboard Creator',
  description: 'Dashboard overview and statistics',
};

export default function Home() {
  return <HomePage />;
}