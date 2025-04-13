import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { DatasetDetailClient } from './client-page';

export const metadata: Metadata = {
  title: 'Dataset Details - BeakDash',
  description: 'View and manage dataset details',
};

export default function DatasetDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <div className="container px-4 py-6">
        <DatasetDetailClient id={params.id} />
      </div>
    </AppLayout>
  );
}