import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { WebSocketProvider } from '@/providers/websocket-provider';

// Configure Inter font
const inter = Inter({ subsets: ['latin'] });

// Define metadata for the app
export const metadata: Metadata = {
  title: 'BeakDash - AI-Powered Analytics Dashboard',
  description: 'A modular dashboard creation platform with AI-powered analytics and highly customizable widgets.',
  keywords: 'dashboard, analytics, AI, widgets, data visualization',
};

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <WebSocketProvider>
              {children}
              <Toaster />
            </WebSocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}