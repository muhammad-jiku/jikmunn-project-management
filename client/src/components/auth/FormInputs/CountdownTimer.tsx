'use client';

import { useAppSelector } from '@/store';
import {
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onExpire,
}) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);

  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);

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
    if (seconds <= 0) {
      onExpire();
      return;
    }
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [seconds, onExpire]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ mb: 2, p: 2, textAlign: 'center' }}>
        <Typography variant='h6' color='text.primary'>
          Time remaining: {seconds}s
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

export default CountdownTimer;
