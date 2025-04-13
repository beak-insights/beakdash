import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { ConnectionCreateClient } from './client-page';

export const metadata: Metadata = {
  title: 'Create Connection - BeakDash',
  description: 'Create a new data connection',
};

export default function CreateConnectionPage({ 
  searchParams,
}: { 
  searchParams: { type?: string } 
}) {
  // Get the type from URL params, using nullish coalescing to handle undefined
  const defaultTab = searchParams?.type ? searchParams.type : 'sql';
  
  return (
    <AppLayout>
      <ConnectionCreateClient defaultTab={defaultTab} />
    </AppLayout>
  );
}