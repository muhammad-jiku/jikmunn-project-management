/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useResetPasswordMutation } from '@/state/api/authApi';
import { useAppSelector } from '@/store';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { Eye, EyeClosed } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import TextInput from '../FormInputs/TextInput';
import CountdownTimer from './CountdownTimer';

interface ResetPasswordFormInputs {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [message, setMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

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
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const newPassword = watch('newPassword');

  // When time expires, show message and redirect
  const handleExpire = () => {
    setMessage('Time expired. Redirecting...');
    setTimeout(() => {
      router.push('/sign-in');
    }, 1000);
  };

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (!token) {
      setMessage('Token is missing');
      return;
    }
    try {
      await resetPassword({ token, newPassword: data.newPassword }).unwrap();
      setMessage('Password has been reset successfully');
      setTimeout(() => router.push('/sign-in'), 3000);
    } catch (err: any) {
      setMessage(err.data?.message || 'Failed to reset password');
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) =>
    e.preventDefault();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth='lg'>
        <Box
          sx={{
            mt: 8,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CountdownTimer initialSeconds={30} onExpire={handleExpire} />

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
                  Reset Password
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Please enter your new password. You have 30 seconds to
                  complete this form.
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextInput
                    label='New Password'
                    name='newPassword'
                    type={showPassword ? 'text' : 'password'}
                    register={register}
                    errors={errors}
                    isRequired
                    registerOptions={{
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      maxLength: {
                        value: 12,
                        message: 'Password cannot exceed 12 characters',
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,12}$/,
                        message:
                          'Password must contain at least one letter, one number, and one special character',
                      },
                      validate: {
                        noSpaces: (value: string) =>
                          !value.includes(' ') ||
                          'Password cannot contain spaces',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            {showPassword ? <EyeClosed /> : <Eye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    label='Confirm Password'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    register={register}
                    errors={errors}
                    isRequired
                    registerOptions={{
                      validate: {
                        match: (value) =>
                          value === newPassword || 'Passwords do not match',
                        noSpaces: (value) =>
                          !value.includes(' ') ||
                          'Password cannot contain spaces',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            {showConfirmPassword ? <EyeClosed /> : <Eye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
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
                  'Reset Password'
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ResetPassword;
