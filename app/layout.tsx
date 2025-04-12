import { Metadata } from 'next';
import React from 'react';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { WebSocketProvider } from '@/providers/websocket-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'BeakDash - AI-Powered Dashboard Creator',
  description: 'Create customized, data-driven dashboards with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}