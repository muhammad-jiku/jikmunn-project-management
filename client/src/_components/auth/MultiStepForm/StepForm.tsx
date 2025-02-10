'use client';

import { RootState } from '@/store'; // Adjust import path as needed
import { Box, ThemeProvider, createTheme } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import Confirmation from './StepsForm/Confirmation';
import PersonalInfo from './StepsForm/PersonalInfo';
import UserInfo from './StepsForm/UserInfo';
import UserRoleSelection from './StepsForm/UserRoleSelection';

// Define step type with form component mapping
type StepComponentMap = {
  [key: number]: React.ComponentType;
};

const StepForm: React.FC = () => {
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);

  // Create theme based on dark mode preference
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#2563eb', // blue-600
          },
          background: {
            default: isDarkMode ? '#121212' : '#ffffff',
            paper: isDarkMode ? '#1e1e1e' : '#ffffff',
          },
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
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 3,
          minHeight: '400px', // Ensure consistent height between steps
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
