'use client';

import { RootState } from '@/store';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import Confirmation from './StepsForm/Confirmation';
import PersonalInfo from './StepsForm/PersonalInfo';
import UserInfo from './StepsForm/UserInfo';
import UserRoleSelection from './StepsForm/UserRoleSelection';

type StepComponentMap = {
  [key: number]: React.ComponentType;
};

const StepForm: React.FC = () => {
  const currentStep = useSelector(
    (state: RootState) => state?.signup?..currentStep
  );
  const isDarkMode = useSelector(
    (state: RootState) => state?.global?.isDarkMode
  );

  // Create theme based on Tailwind config and dark mode preference
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6', // Tailwind blue-200 and blue-500
            dark: isDarkMode ? '#60a5fa' : '#2563eb', // Tailwind blue-400 and blue-600
            contrastText: '#ffffff',
          },
          background: {
            default: isDarkMode ? '#101214' : '#f3f4f6', // dark-bg or gray-100
            paper: isDarkMode ? '#1d1f21' : '#ffffff', // dark-secondary or white
          },
          text: {
            primary: isDarkMode ? '#f3f4f6' : '#1f2937', // gray-100 or gray-800
            secondary: isDarkMode ? '#6b7280' : '#374151', // Tailwind gray-500 or gray-700
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

  // Define step to component mapping
  const stepComponents: StepComponentMap = {
    1: UserRoleSelection,
    2: PersonalInfo,
    3: UserInfo,
    4: Confirmation,
  };

  const renderFormByStep = (step: number): React.ReactNode => {
    const StepComponent = stepComponents[step];
    return StepComponent ? <StepComponent /> : null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: isDarkMode ? '#101214' : '#ffffff',
          color: isDarkMode ? '#f3f4f6' : '#1f2937',
          borderRadius: 2,
          padding: 3,
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderFormByStep(currentStep)}
      </Box>
    </ThemeProvider>
  );
};

export default StepForm;
