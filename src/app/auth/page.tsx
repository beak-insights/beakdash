import { Metadata } from 'next';
import AuthPage from '@/components/pages/auth-page';

export const metadata: Metadata = {
  title: 'Authentication - AI Dashboard Creator',
  description: 'Log in or register to access your dashboards',
};

export default function Auth() {
  return <AuthPage />;
}