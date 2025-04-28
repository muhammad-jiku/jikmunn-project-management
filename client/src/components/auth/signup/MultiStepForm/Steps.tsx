import { RootState } from '@/store';
import {
  Box,
  CssBaseline,
  Paper,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useSelector } from 'react-redux';
import Step from './Step';

interface Step {
  number: number;
  title: string;
}

interface StepsProps {
  steps: Step[];
}

const StepsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  gridColumn: '1 / -1',

  [theme.breakpoints.up('md')]: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
}));

const Steps: React.FC<StepsProps> = ({ steps }) => {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            md: 'repeat(12, minmax(0, 1fr))',
          },
          gap: 2,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          padding: 2,
          borderRadius: 2,
        }}
      >
        <StepsContainer elevation={3}>
          {steps.map((step, i) => (
            <Step key={i} step={step} />
          ))}
        </StepsContainer>
      </Box>
    </ThemeProvider>
  );
};

export default Steps;
