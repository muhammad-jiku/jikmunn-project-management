import { RootState } from '@/store';
import { Box, styled, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

interface StepProps {
  step: {
    number: number;
    title: string;
  };
}

const Step: React.FC<StepProps> = ({ step }) => {
  const { number, title } = step;
  const theme = useTheme();
  const currentStep = useSelector(
    (state: RootState) => state?.signup?..currentStep
  );
  const isDarkMode = useSelector(
    (state: RootState) => state?.global?.isDarkMode
  );

  const getStepCircleStyle = () => {
    const baseStyle = {
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      fontWeight: 'bold',
      border: `2px solid ${
        number === currentStep
          ? theme.palette.primary.main
          : isDarkMode
            ? theme.palette.text.secondary
            : theme.palette.text.primary
      }`,
      color:
        number === currentStep
          ? theme.palette.primary.contrastText
          : isDarkMode
            ? theme.palette.text.secondary
            : theme.palette.text.primary,
      backgroundColor:
        number === currentStep ? theme.palette.primary.main : 'transparent',
    };

    return baseStyle;
  };

  const StepTypo = styled(Typography)(({}) => ({
    textAlign: 'center',

    [theme.breakpoints.up('md')]: {
      textAlign: 'left',
    },
  }));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
        alignItems: 'center',
        gap: 2,
        padding: 2,
      }}
    >
      <Box sx={getStepCircleStyle()}>{number}</Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <StepTypo
          variant='caption'
          sx={{
            textTransform: 'uppercase',
            color: theme.palette.text.secondary,
          }}
        >
          Step {number}
        </StepTypo>
        <Typography
          variant='subtitle1'
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: theme.palette.text.primary,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default Step;
