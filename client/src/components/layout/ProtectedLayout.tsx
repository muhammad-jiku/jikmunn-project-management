'use client';

import { getLayoutConfig } from '@/config';
import StoreProvider from '@/store';
import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import SharedLayout from './SharedLayout';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const layoutConfig = getLayoutConfig('root');

  return (
    <SharedLayout
      showSidebar={layoutConfig.showSidebar}
      showNavbar={layoutConfig.showNavbar}
    >
      {children}
    </SharedLayout>
  );
};

// This wrapper is specifically for protected routes
const ProtectedLayoutWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StoreProvider>
      <ProtectedRoute>
        <ProtectedLayout>{children}</ProtectedLayout>
      </ProtectedRoute>
    </StoreProvider>
  );
};

export default ProtectedLayoutWrapper;
