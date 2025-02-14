/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { RootState, useAppSelector } from '@/store';
import {
  Box,
  Button,
  CircularProgress,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const isDarkMode = useAppSelector(
    (state: RootState) => state.global.isDarkMode
  );

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
    typography: { fontFamily: 'inherit' },
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing.');
      setIsLoading(false);
      return;
    }

    const verifyEmailRequest = async () => {
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

        console.log('response', response);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to verify email');
        }
        setSuccess(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailRequest();
  }, [token]);

  const handleGoHome = () => {
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
        ) : success ? (
          <>
            <Typography variant='h6' color='primary' sx={{ mb: 2 }}>
              Your email has been verified successfully!
            </Typography>
            <Button variant='contained' onClick={handleGoHome}>
              Continue
            </Button>
          </>
        ) : error ? (
          <>
            <Typography variant='h6' color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant='contained' onClick={handleGoHome}>
              Go Home
            </Button>
          </>
        ) : null}
      </Box>
    </ThemeProvider>
  );
};

export default VerifyEmailPage;
