import { Metadata } from 'next';
import React from 'react';
import './styles/globals.css';
import ClientLayout from './client-layout';

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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}