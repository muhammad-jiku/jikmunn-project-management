'use client';

import { getLayoutConfig } from '@/config';
import StoreProvider, { useAppSelector } from '@/store';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Inter } from 'next/font/google';
import React, { useEffect } from 'react';
import SharedLayout from './SharedLayout';

const inter = Inter({ subsets: ['latin'] });

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const layoutConfig = getLayoutConfig('auth');

  // Create theme based on dark mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6',
            dark: isDarkMode ? '#60a5fa' : '#2563eb',
            contrastText: '#ffffff',
          },
          background: {
            default: isDarkMode ? '#101214' : '#f3f4f6',
            paper: isDarkMode ? '#1d1f21' : '#ffffff',
          },
          text: {
            primary: isDarkMode ? '#f3f4f6' : '#1f2937',
            secondary: isDarkMode ? '#6b7280' : '#374151',
          },
          grey: {
            100: isDarkMode ? '#1f2937' : '#f3f4f6',
            200: isDarkMode ? '#374151' : '#e5e7eb',
            700: isDarkMode ? '#6b7280' : '#374151',
            800: isDarkMode ? '#1d1f21' : '#1f2937',
            900: isDarkMode ? '#101214' : '#111827',
          },
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: 'inherit',
        },
      }),
    [isDarkMode]
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={inter.className}>
        <SharedLayout
          showSidebar={layoutConfig.showSidebar}
          showNavbar={layoutConfig.showNavbar}
        >
          {children}
        </SharedLayout>
      </div>
    </ThemeProvider>
  );
};

// Wrapper with StoreProvider
const AuthLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthLayout>{children}</AuthLayout>
    </StoreProvider>
  );
};

export default AuthLayoutWrapper;
