import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { ConnectionEditClient } from './client-page';

export const metadata: Metadata = {
  title: 'Edit Connection - BeakDash',
  description: 'Edit an existing data connection',
};

export default async function EditConnectionPage({ 
  params,
}: { 
  params: { id: string } 
}) {
  // Get the params, using nullish coalescing to handle undefined
  const resolvedParams = await Promise.resolve(params);
  const connectionId = resolvedParams.id;
  
  return (
    <AppLayout>
      <ConnectionEditClient connectionId={connectionId} />
    </AppLayout>
  );
} 