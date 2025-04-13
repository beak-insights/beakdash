import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { ConnectionCreateClient } from './client-page';

export const metadata: Metadata = {
  title: 'Create Connection - BeakDash',
  description: 'Create a new data connection',
};

export default async function CreateConnectionPage({ 
  searchParams,
}: { 
  searchParams: { type?: string } 
}) {
  // Get the type from URL params, using nullish coalescing to handle undefined
  const params = await Promise.resolve(searchParams);
  const defaultTab = params?.type || 'sql';
  
  return (
    <AppLayout>
      <ConnectionCreateClient defaultTab={defaultTab} />
    </AppLayout>
  );
}