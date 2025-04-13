import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { ConnectionsClient } from './client-page';

export const metadata: Metadata = {
  title: 'BeakDash - Data Connections',
  description: 'Manage your data connections',
};

export default function ConnectionsPage() {
  return (
    <AppLayout>
      <ConnectionsClient />
    </AppLayout>
  );
}