import { RootState } from '@/store'; // Adjust the import path as needed
import { Box, Paper, ThemeProvider, createTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useSelector } from 'react-redux';
import Step from './Step';

// Define the step interface
interface Step {
  number: number;
  title: string;
}

interface StepsProps {
  steps: Step[];
}

// Create styled components
const StepsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  gridColumn: '1 / -1', // span full width by default

  [theme.breakpoints.up('md')]: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gridColumn: 'span 4 / span 4', // span 4 columns on md and up
  },
}));

const Steps: React.FC<StepsProps> = ({ steps }) => {
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);

  // Create theme based on dark mode preference
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#2563eb', // blue-600 equivalent
            dark: '#1d4ed8', // darker blue for hover states
            contrastText: '#ffffff',
          },
          background: {
            paper: '#2563eb', // blue-600 equivalent
          },
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            md: 'repeat(12, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <StepsContainer elevation={0}>
          {steps.map((step, i) => (
            <Step key={i} step={step} />
          ))}
        </StepsContainer>
      </Box>
    </ThemeProvider>
  );
};

export default Steps;
