/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useChangePasswordMutation } from '@/state/api/authApi';
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
import { Eye, EyeClosed } from 'lucide-react';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import TextInput from '../auth/FormInputs/TextInput';

interface ChangePassowordFormInputs {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePassword: React.FC = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [changePassword, { isLoading, error }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePassowordFormInputs>();
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] =
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

  const newPassword = watch('newPassword');

  const onSubmit: SubmitHandler<ChangePassowordFormInputs> = async (data) => {
    try {
      if (data.newPassword !== data.confirmNewPassword) {
        alert('Passwords do not match');
        return;
      }
      const result = await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();
      console.log('Change password result:', result);
    } catch (err: any) {
      console.error('Change password error:', err);
    }
  };

  const handleClickShowOldPassword = () => setShowOldPassword(!showOldPassword);
  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleClickShowConfirmNewPassword = () =>
    setShowConfirmNewPassword(!showConfirmNewPassword);
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
                  Update Password
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Please provide your previous password and create a new strong
                  password.
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextInput
                    label='Old Password'
                    name='oldPassword'
                    type={showOldPassword ? 'text' : 'password'}
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
                            onClick={handleClickShowOldPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            {showOldPassword ? <EyeClosed /> : <Eye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    label='New Password'
                    name='newPassword'
                    type={showNewPassword ? 'text' : 'password'}
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
                            onClick={handleClickShowNewPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            {showNewPassword ? <EyeClosed /> : <Eye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    label='Confirm New Password'
                    name='confirmNewPassword'
                    type={showConfirmNewPassword ? 'text' : 'password'}
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
                            onClick={handleClickShowConfirmNewPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            {showConfirmNewPassword ? <EyeClosed /> : <Eye />}
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
                {isLoading ? 'Loading...' : 'Update'}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ChangePassword;
