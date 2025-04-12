'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from './providers/query-provider';
import { WebSocketProvider } from './providers/websocket-provider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <QueryProvider>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </QueryProvider>
    </SessionProvider>
  );
}