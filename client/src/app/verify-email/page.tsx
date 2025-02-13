/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { RootState } from '@/store';
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const VerifyEmailPage: React.FC = () => {
  // Get the token from the URL query string.
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Access your router to perform navigation.
  const router = useRouter();

  // Access global state to determine dark mode.
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);

  // Create a theme that matches your project.
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: isDarkMode ? '#93c5fd' : '#3b82f6' },
      background: {
        default: isDarkMode ? '#101214' : '#f3f4f6',
        paper: isDarkMode ? '#1d1f21' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f3f4f6' : '#1f2937',
      },
    },
    typography: {
      fontFamily: 'inherit',
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    // If no token is provided, show an error.
    if (!token) {
      setError('Verification token is missing.');
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to verify email');
        }

        // If the response is OK, mark as successful.
        setSuccess(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoHome = () => {
    // Navigate to the home route.
    router.push('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight='100vh'
        p={2}
      >
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <>
            <Typography variant='h6' color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant='contained' onClick={handleGoHome}>
              Go Home
            </Button>
          </>
        ) : success ? (
          <>
            <Typography variant='h6' color='primary' sx={{ mb: 2 }}>
              Your email has been verified successfully!
            </Typography>
            <Button variant='contained' onClick={handleGoHome}>
              Continue
            </Button>
          </>
        ) : null}
      </Box>
    </ThemeProvider>
  );
};

export default VerifyEmailPage;
