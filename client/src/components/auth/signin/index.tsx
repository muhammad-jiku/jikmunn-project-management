/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useLoginMutation } from '@/state/api/authApi';
import { useAppSelector } from '@/store';
import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { Eye, EyeClosed, MailWarning } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import TextInput from '../FormInputs/TextInput';

interface SignInFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignInForm: React.FC = () => {
  const router = useRouter();
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const [login, { isLoading, error }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInFormInputs>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

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

  const password = watch('password');

  const onSubmit: SubmitHandler<SignInFormInputs> = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      const result: any = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      // If email is not verified, inform the user and do not navigate.
      if (result.data.needsEmailVerification) {
        toast.custom(
          <div className='bg-white px-6 py-4 shadow-md rounded-md flex items-start'>
            <MailWarning
              className='text-orange-500 flex-shrink-0 mr-3 mt-0.5'
              size={20}
            />
            <p className='text-gray-800'>
              Your email is not verified. A verification email has been sent.
              Please check your inbox (and spam folder) and verify your email
              before signing in.
            </p>
          </div>
        );
        // Optionally, you could disable further navigation or provide a button for manual verification check.
        return;
      } else {
        toast.success(result.message || 'Signing in successful.');
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err && 'Something went wrong, Please try again.');
      // console.error('Login error:', err); // debugging log
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
                  Sign In
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Please provide your email and password
                </Typography>
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
                <Grid item xs={12}>
                  <TextInput
                    label='Password'
                    name='password'
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
                          value === password || 'Passwords do not match',
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
              {error && (
                <Typography variant='body2' color='error' sx={{ mt: 2 }}>
                  {(error as any).data?.message ||
                    'Something went wrong, Please try again!'}
                </Typography>
              )}
              <Button
                type='submit'
                variant='contained'
                fullWidth
                sx={{ mt: 3 }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          </form>
          <Box
            sx={{
              mt: 2,
              px: 2,
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              justifyContent: { xs: 'initial', lg: 'space-between' },
              alignItems: { xs: 'center', lg: 'space-between' },
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Forget password?{' '}
              <Link
                href='/forget-password'
                style={{ color: theme.palette.text.primary }}
              >
                Click here
              </Link>
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Don't have an account?{' '}
              <Link
                href='/sign-up'
                style={{ color: theme.palette.text.primary }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SignInForm;
