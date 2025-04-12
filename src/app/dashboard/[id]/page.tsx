import { Metadata } from 'next';
import DashboardDetail from '@/components/pages/dashboard-detail';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // This could fetch the dashboard data to get the actual title
  return {
    title: `Dashboard ${params.id} - AI Dashboard Creator`,
    description: 'View and interact with your dashboard',
  };
}

export default function Dashboard({ params }: Props) {
  return <DashboardDetail id={parseInt(params.id, 10)} />;
}