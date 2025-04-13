import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { CreateDatasetClient } from './client-page';

export const metadata: Metadata = {
  title: 'Create Dataset - BeakDash',
  description: 'Create a new dataset using real data connections',
};

export default function CreateDatasetPage() {
  return (
    <AppLayout>
      <CreateDatasetClient />
    </AppLayout>
  );
}