import { Metadata } from 'next';
import React from 'react';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { WebSocketProvider } from '@/providers/websocket-provider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'BeakDash - Dashboard Creator',
  description: 'AI-powered dashboard creation platform',
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