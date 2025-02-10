// NavButtons.tsx
import { setCurrentStep } from '@/state/signupSlice';
import { RootState } from '@/store';
import { Box, Button, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Add 'disabled' prop to the component's props interface
interface NavButtonsProps {
  disabled?: boolean;
}

const NavButtons: React.FC<NavButtonsProps> = ({ disabled }) => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const theme = useTheme();

  const handlePrevious = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  return (
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
  );
};

export default NavButtons;
