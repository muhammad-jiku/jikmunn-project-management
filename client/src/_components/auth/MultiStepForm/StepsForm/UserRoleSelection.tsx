/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { setCurrentStep, updateFormData } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Box,
  CssBaseline,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Paper,
  Radio,
  RadioGroup,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
} from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';

interface FormData {
  role: UserRole;
  [key: string]: any;
}

type UserRole = 'DEVELOPER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 6),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 6),
  },
  backgroundColor: theme.palette.background.default,
  borderRadius: 2,
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const RoleCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(37, 99, 235, 0.1)'
        : 'rgba(37, 99, 235, 0.05)',
  },
}));

const UserRoleSelection: React.FC = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [loading, setLoading] = useState(false);

  const roleOptions: RoleOption[] = [
    {
      value: 'DEVELOPER',
      label: 'Developer',
      description: 'Access to code repositories and development tools',
    },
    {
      value: 'MANAGER',
      label: 'Manager',
      description: 'Manage team members and project resources',
    },
    {
      value: 'ADMIN',
      label: 'Admin',
      description: 'Full system administration capabilities',
    },
    {
      value: 'SUPER_ADMIN',
      label: 'Super Admin',
      description: 'Complete control over all system aspects',
    },
  ];

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
        },
        typography: {
          fontFamily: 'inherit',
        },
      }),
    [isDarkMode]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      role: formData?.role || 'DEVELOPER',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
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
              Choose Your Role
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Choose the role that best matches your responsibilities
            </Typography>
          </HeaderContainer>

          <FormControl error={!!errors.role} component='fieldset'>
            <Controller
              name='role'
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Please select a role',
                },
              }}
              render={({ field }) => (
                <RadioGroup {...field} aria-label='user-role'>
                  {roleOptions.map((role) => (
                    <RoleCard
                      key={role.value}
                      isSelected={field.value === role.value}
                      elevation={field.value === role.value ? 2 : 1}
                    >
                      <FormControlLabel
                        value={role.value}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant='subtitle1' fontWeight='bold'>
                              {role.label}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {role.description}
                            </Typography>
                          </Box>
                        }
                      />
                    </RoleCard>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.role && (
              <FormHelperText>{errors.role.message}</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <NavButtons disabled={loading} />
          </Box>
        </FormContainer>
      </form>
    </ThemeProvider>
  );
};

export default UserRoleSelection;
