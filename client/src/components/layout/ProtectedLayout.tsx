'use client';

import StoreProvider, { useAppSelector } from '@/store';
import React, { useEffect } from 'react';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';
import ProtectedRoute from './ProtectedRoute';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state?.global?.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className='flex min-h-screen w-full bg-gray-50 text-gray-900 dark:bg-dark-bg dark:text-gray-100'>
      <Sidebar />
      <main
        className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
          isSidebarCollapsed ? '' : 'md:pl-64'
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
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
