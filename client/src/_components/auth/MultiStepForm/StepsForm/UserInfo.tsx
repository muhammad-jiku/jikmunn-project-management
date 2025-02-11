import { setCurrentStep, updateFormData } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Box,
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
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';
import TextInput from '../../FormInputs/TextInput';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const UserInfo: React.FC = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: isDarkMode ? '#93c5fd' : '#3b82f6' },
      background: {
        default: isDarkMode ? '#101214' : '#f3f4f6',
        paper: isDarkMode ? '#1d1f21' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f3f4f6' : '#1f2937',
        secondary: isDarkMode ? '#6b7280' : '#374151',
      },
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: formData.username || '',
      email: formData.email || '',
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
    },
    mode: 'onChange',
  });

  const password = watch('password');

  const processData = async (data: FormData) => {
    try {
      setLoading(true);
      if (data.password !== data.confirmPassword) {
        console.error('Passwords do not match');
        return;
      }
      // Update base account details
      dispatch(updateFormData(data));
      dispatch(setCurrentStep(currentStep + 1));
    } catch (error) {
      console.error('Error processing form data:', error);
    } finally {
      setLoading(false);
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
      <form onSubmit={handleSubmit(processData)}>
        <Box
          sx={{
            padding: { xs: 2, sm: 6 },
            backgroundColor: theme.palette.background.default,
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
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
                registerOptions={{
                  pattern: {
                    value: /^[a-z][a-z0-9!@#$%^&*_-]*$/,
                    message:
                      'Username must start with a letter and be lowercase',
                  },
                  validate: {
                    noSpaces: (value) =>
                      !value.includes(' ') || 'Username cannot contain spaces',
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase();
                  },
                }}
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
                    noSpaces: (value) =>
                      !value.includes(' ') || 'Password cannot contain spaces',
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
            <Grid item xs={12} sm={6}>
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
                      !value.includes(' ') || 'Password cannot contain spaces',
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
          <Box sx={{ mt: 3 }}>
            <NavButtons disabled={loading} />
          </Box>
        </Box>
      </form>
    </ThemeProvider>
  );
};

export default UserInfo;
