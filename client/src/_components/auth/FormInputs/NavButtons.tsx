import { setCurrentStep } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Box,
  Button,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface NavButtonsProps {
  disabled?: boolean;
}

const NavButtons: React.FC<NavButtonsProps> = ({ disabled }) => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6',
            dark: isDarkMode ? '#60a5fa' : '#2563eb',
          },
          grey: {
            800: isDarkMode ? '#1d1f21' : '#1f2937',
            900: isDarkMode ? '#101214' : '#111827',
          },
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [isDarkMode]
  );

  const handlePrevious = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        {currentStep > 1 && (
          <Button
            onClick={handlePrevious}
            type='button'
            variant='contained'
            startIcon={<ChevronLeft />}
            disabled={disabled}
            sx={{
              mt: { xs: 2, sm: 3 },
              backgroundColor: isDarkMode
                ? theme.palette.primary.dark
                : theme.palette.grey[900],
              '&:hover': {
                backgroundColor: isDarkMode
                  ? theme.palette.primary.main
                  : theme.palette.grey[800],
              },
              color: theme.palette.common.white,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            Previous
          </Button>
        )}
        <Button
          type='submit'
          variant='contained'
          endIcon={<ChevronRight />}
          disabled={disabled}
          sx={{
            mt: { xs: 2, sm: 3 },
            backgroundColor: isDarkMode
              ? theme.palette.primary.dark
              : theme.palette.grey[900],
            '&:hover': {
              backgroundColor: isDarkMode
                ? theme.palette.primary.main
                : theme.palette.grey[800],
            },
            color: theme.palette.common.white,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {currentStep === 4 ? 'Confirm and Submit' : 'Save and Continue'}
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default NavButtons;
