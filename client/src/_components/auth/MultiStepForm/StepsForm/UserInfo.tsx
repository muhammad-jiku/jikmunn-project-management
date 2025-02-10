/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { setCurrentStep, updateFormData } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Box,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';
import TextInput from '../../FormInputs/TextInput';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  [key: string]: any;
}

const UserInfo: React.FC = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [loading, setLoading] = useState(false);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6', // Tailwind blue-200 and blue-500
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
      }),
    [isDarkMode]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...formData,
    },
  });

  const processData = async (data: FormData) => {
    try {
      setLoading(true);
      dispatch(updateFormData(data));
      dispatch(setCurrentStep(currentStep + 1));
    } catch (error) {
      console.error('Error processing form data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <form onSubmit={handleSubmit(processData)}>
        <Box
          sx={{
            padding: { xs: 2, sm: 6 },
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: theme.palette.text.primary,
              }}
            >
              User Info
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Please provide your account details
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='Username'
                name='username'
                register={register}
                errors={errors}
                isRequired
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='Email'
                name='email'
                type='email'
                register={register}
                errors={errors}
                isRequired
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='Password'
                name='password'
                type='password'
                register={register}
                errors={errors}
                isRequired
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='Confirm Password'
                name='confirmPassword'
                type='password'
                register={register}
                errors={errors}
                isRequired
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <NavButtons disabled={loading} />
          </Box>
        </Box>
      </form>
    </ThemeProvider>
  );
};

export default UserInfo;
