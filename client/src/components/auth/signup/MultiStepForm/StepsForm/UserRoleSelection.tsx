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
import NavButtons from '../../../FormInputs/NavButtons';
import StepFormHeader from '../StepFormHeader';

// type UserRole = 'DEVELOPER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
type UserRole = 'DEVELOPER' | 'MANAGER';

interface FormData {
  role: UserRole;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 6),
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
    (state: RootState) => state?.signup?.currentStep
  );
  const formData = useSelector((state: RootState) => state?.signup?.formData);
  const isDarkMode = useSelector(
    (state: RootState) => state?.global?.isDarkMode
  );
  const [loading, setLoading] = useState(false);

  const roleOptions = [
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
  ] as const;

  const theme = createTheme({
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
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      role: formData.role || 'DEVELOPER',
      username: formData.username || '',
      email: formData.email || '',
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
    },
    mode: 'onSubmit',
  });

  const processData = async (data: FormData) => {
    try {
      setLoading(true);
      // Dispatch base data (role, username, email, password, confirmPassword)
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
            <StepFormHeader />
            <Typography variant='body1' color='text.secondary'>
              Choose the role that best matches your responsibilities
            </Typography>
          </HeaderContainer>
          <FormControl error={!!errors.role} component='fieldset'>
            <Controller
              name='role'
              control={control}
              rules={{ required: 'Please select a role' }}
              render={({ field }) => (
                <RadioGroup {...field} aria-label='user-role'>
                  {roleOptions.map((role) => (
                    <RoleCard
                      key={role.value}
                      isSelected={field.value === role.value}
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
