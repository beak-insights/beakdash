'use client';

import React, { ComponentType } from 'react';
import { ProtectedRoute } from './protected-route';

/**
 * Higher-order component to wrap pages that require authentication
 * @param Component The component that requires authentication
 * @returns A component wrapped with authentication protection
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedPage(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}