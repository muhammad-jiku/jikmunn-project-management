/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForgotPasswordMutation } from '@/state/api/authApi';
import { useAppSelector } from '@/store';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import TextInput from '../FormInputs/TextInput';

interface ForgotPasswordFormInputs {
  email: string;
}

const ForgetPassword: React.FC = () => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  // Replace with your selector if you have dark mode state
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6',
            dark: isDarkMode ? '#60a5fa' : '#2563eb',
            contrastText: '#ffffff',
          },
          background: {
            default: isDarkMode ? '#101214' : '#f3f4f6',
            paper: isDarkMode ? '#1d1f21' : '#ffffff',
          },
          text: {
            primary: isDarkMode ? '#f3f4f6' : '#1f2937',
            secondary: isDarkMode ? '#6b7280' : '#374151',
          },
          grey: {
            100: isDarkMode ? '#1f2937' : '#f3f4f6',
            200: isDarkMode ? '#374151' : '#e5e7eb',
            700: isDarkMode ? '#6b7280' : '#374151',
            800: isDarkMode ? '#1d1f21' : '#1f2937',
            900: isDarkMode ? '#101214' : '#111827',
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
  const [message, setMessage] = useState<string>('');

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      await forgotPassword(data).unwrap();
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setMessage(err.data?.message || 'Failed to send password reset email.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth='md'>
        <Box
          sx={{
            mt: 8,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box
              sx={{
                padding: { xs: 2, sm: 6 },
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant='h4'
                  color='text.primary'
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  Forget Password?
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Enter your email to receive a password reset link.
                </Typography>{' '}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextInput
                    label='Email'
                    name='email'
                    type='email'
                    register={register}
                    errors={errors}
                    isRequired
                  />
                </Grid>
              </Grid>
              {message && (
                <Typography
                  variant='body2'
                  color={error ? 'error' : 'primary'}
                  sx={{ mt: 2, textAlign: 'center' }}
                >
                  {message}
                </Typography>
              )}
              <Button
                type='submit'
                variant='contained'
                fullWidth
                sx={{ mt: 3 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color='inherit' />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ForgetPassword;
