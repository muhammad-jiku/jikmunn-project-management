'use client';

import { useAppSelector } from '@/store';
import React, { useEffect } from 'react';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';

interface SharedLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean; // Optional prop to control sidebar visibility
  showNavbar?: boolean; // Optional prop to control navbar visibility
}

const SharedLayout: React.FC<SharedLayoutProps> = ({
  children,
  showSidebar = true, // Default to showing sidebar
  showNavbar = true, // Default to showing navbar
}) => {
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
      {showSidebar && <Sidebar />}
      <main
        className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
          showSidebar && !isSidebarCollapsed ? 'md:pl-64' : ''
        }`}
      >
        {showNavbar && <Navbar />}
        {children}
      </main>
    </div>
  );
};

export default SharedLayout;
