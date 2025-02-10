'use client';

import StepForm from '@/_components/auth/MultiStepForm/StepForm';
import Steps from '@/_components/auth/MultiStepForm/Steps';
import { RootState } from '@/store';
import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  Paper,
  ThemeProvider,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

interface Step {
  number: number;
  title: string;
}

const SignUp: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);

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

  const steps: Step[] = [
    { number: 1, title: 'Choose Your Role' },
    { number: 2, title: 'Personal Information' },
    { number: 3, title: 'User Information' },
    { number: 4, title: 'Submit and Confirmation' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          p: 4,
        }}
      >
        <Container maxWidth='xl'>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 4 },
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
              gap: 4,
              minHeight: '100vh',
            }}
          >
            {/* Steps */}
            <Steps steps={steps} />

            {/* Form */}
            <Box sx={{ borderRadius: 2 }}>
              <StepForm />
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default SignUp;
