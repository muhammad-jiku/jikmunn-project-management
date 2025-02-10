import { RootState } from '@/store';
import { Box, ThemeProvider, Typography, createTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useSelector } from 'react-redux';

// Define the step interface
interface StepProps {
  step: {
    number: number;
    title: string;
  };
}

// Create styled components
const StepCircle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  flexShrink: 0,
  fontWeight: 700,
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[800]}`,
  color:
    theme.palette.mode === 'dark'
      ? theme.palette.grey[300]
      : theme.palette.grey[800],
  ...(isActive && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    border: 'none',
  }),
}));

const StepContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

const StepInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
}));

const Step: React.FC<StepProps> = ({ step }) => {
  const { number, title } = step;
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
            main: '#90caf9', // Light blue similar to the original blue-300
          },
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <StepContainer>
        <StepCircle isActive={number === currentStep}>{number}</StepCircle>
        <StepInfo>
          <Typography
            variant='caption'
            sx={{
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            Step {number}
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
        </StepInfo>
      </StepContainer>
    </ThemeProvider>
  );
};

export default Step;
