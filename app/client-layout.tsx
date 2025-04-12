'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from './providers/query-provider';
import { WebSocketProvider } from './providers/websocket-provider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}