import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BeakDash - Authentication',
  description: 'Sign in or register for an account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}