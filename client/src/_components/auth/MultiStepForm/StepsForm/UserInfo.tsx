/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { setCurrentStep, updateFormData } from '@/state/signupSlice';
import { RootState } from '@/store'; // Adjust import path as needed
import {
  Box,
  createTheme,
  Grid,
  styled,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';
import TextInput from '../../FormInputs/TextInput';

// Define interfaces for our data structures
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  location: string;
  country: string;
  [key: string]: any; // For any additional fields
}

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 6),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 6),
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const UserInfo: React.FC = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [loading, setLoading] = useState(false);

  // Create theme based on dark mode preference
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#2563eb', // blue-600
          },
          background: {
            default: isDarkMode ? '#121212' : '#ffffff',
            paper: isDarkMode ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: isDarkMode ? '#ffffff' : '#111827',
            secondary: isDarkMode ? '#9ca3af' : '#4b5563',
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
      <form onSubmit={handleSubmit(processData)}>
        <FormContainer>
          <HeaderContainer>
            <Typography
              variant='h4'
              component='h5'
              sx={{
                fontWeight: 700,
                mb: 1,
                fontSize: {
                  xs: '1.5rem',
                  md: '2rem',
                },
              }}
            >
              User Info
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Please provide your username, email address, password, and confirm
              password.
            </Typography>
          </HeaderContainer>

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
        </FormContainer>
      </form>
    </ThemeProvider>
  );
};

export default UserInfo;
