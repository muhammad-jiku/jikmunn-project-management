import { Typography } from '@mui/material';
import React from 'react';

const StepFormHeader: React.FC = () => {
  return (
    <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
      Create New Account
    </Typography>
  );
};

export default StepFormHeader;
