/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { setCurrentStep, updateFormData } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Box,
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
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

// Define interfaces
interface FormData {
  role: UserRole;
  [key: string]: any;
}

type UserRole = 'developer' | 'manager' | 'admin' | 'super_admin';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  const roleOptions: RoleOption[] = [
    {
      value: 'developer',
      label: 'Developer',
      description: 'Access to code repositories and development tools',
    },
    {
      value: 'manager',
      label: 'Manager',
      description: 'Manage team members and project resources',
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Full system administration capabilities',
    },
    {
      value: 'super_admin',
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
            main: '#2563eb',
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
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      role: formData?.role || 'developer',
    },
  });

  const currentRole = watch('role');

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
              Select Your Role
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Choose the role that best matches your responsibilities
            </Typography>
          </HeaderContainer>

          <FormControl error={!!errors.role} component='fieldset'>
            <RadioGroup
              aria-label='user-role'
              {...register('role', { required: 'Please select a role' })}
              value={currentRole}
            >
              {roleOptions.map((role) => (
                <RoleCard
                  key={role.value}
                  isSelected={currentRole === role.value}
                  elevation={currentRole === role.value ? 2 : 1}
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
            {errors.role && (
              <FormHelperText>{errors.role.message}</FormHelperText>
            )}
          </FormControl>
        </FormContainer>
      </form>
    </ThemeProvider>
  );
};

export default UserRoleSelection;
