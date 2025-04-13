'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from './providers/query-provider';
import { WebSocketProvider } from './providers/websocket-provider';
import { Toaster } from '@/components/ui/toaster';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force the session to refresh on client load to ensure consistency
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      <QueryProvider>
        <WebSocketProvider>
          {children}
          <Toaster />
        </WebSocketProvider>
      </QueryProvider>
    </SessionProvider>
  );
}