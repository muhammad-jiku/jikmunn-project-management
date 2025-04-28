/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useSignupAdminMutation,
  useSignupDeveloperMutation,
  useSignupManagerMutation,
  useSignupSuperAdminMutation,
} from '@/state/api/usersApi';
import { resetSignup } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Avatar,
  Box,
  Button,
  createTheme,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { Eye, EyeClosed } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import NavButtons from '../../../FormInputs/NavButtons';
import TextInput from '../../../FormInputs/TextInput';
import StepFormHeader from '../StepFormHeader';

const Confirmation: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(
    (state: RootState) => state?.global?.isDarkMode
  );
  const formData = useSelector((state: RootState) => state?.signup?.formData);
  const globalUser = useSelector(
    (state: RootState) => state?.global?.user?.data
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  // Local state to manage verification status
  const [isVerificationPending, setIsVerificationPending] =
    useState<boolean>(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  // Mutation hooks for signup
  const [signupDeveloper, { error: developerError }] =
    useSignupDeveloperMutation();
  const [signupManager, { error: managerError }] = useSignupManagerMutation();
  const [signupAdmin, { error: adminError }] = useSignupAdminMutation();
  const [signupSuperAdmin, { error: superAdminError }] =
    useSignupSuperAdminMutation();

  // Compute the role-specific personal info.
  const personalInfo =
    formData.role === 'DEVELOPER'
      ? formData.developer
      : formData.role === 'MANAGER'
        ? formData.manager
        : formData.role === 'ADMIN'
          ? formData.admin
          : formData.superAdmin;

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

  // Prepare payload according to SignupPayload interface
  const userData = {
    role: formData.role,
    username: formData.username,
    email: formData.email,
    password: formData.password,
  };

  let profileData: any = {};
  if (formData.role === 'DEVELOPER' && formData.developer) {
    profileData = formData.developer;
  } else if (formData.role === 'MANAGER' && formData.manager) {
    profileData = formData.manager;
  } else if (formData.role === 'ADMIN' && formData.admin) {
    profileData = formData.admin;
  } else if (formData.role === 'SUPER_ADMIN' && formData.superAdmin) {
    profileData = formData.superAdmin;
  }

  const payload = { userData, profileData };
  console.log('payload..', payload);
  // Helper to convert underscore_separated string to camelCase
  const toCamelCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };
  // helper to transform payload for signup endpoints
  const transformSignupPayload = (payload: {
    userData: any;
    profileData: any;
  }) => {
    const { userData, profileData } = payload;
    // Lowercase the role key to use as the nested property name.
    const roleKey = toCamelCase(userData.role); // "SUPER_ADMIN" becomes "superAdmin", and e.g., "developer", "manager", etc.
    return {
      ...userData,
      [roleKey]: profileData,
    };
  };

  const {
    register,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: formData,
  });

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) =>
    e.preventDefault();

  // Handle form submission (signup)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError(null);
    try {
      console.log('Final signup data:', JSON.stringify(formData, null, 2));
      let result;
      const transformedPayload = transformSignupPayload(payload);
      console.log('transformed payload..', transformedPayload);
      if (formData.role === 'DEVELOPER') {
        result = await signupDeveloper(transformedPayload).unwrap();
      } else if (formData.role === 'MANAGER') {
        result = await signupManager(transformedPayload).unwrap();
      } else if (formData.role === 'ADMIN') {
        result = await signupAdmin(transformedPayload).unwrap();
      } else if (formData.role === 'SUPER_ADMIN') {
        result = await signupSuperAdmin(transformedPayload).unwrap();
      } else {
        throw new Error('Invalid user role');
      }
      console.log('Signup successful:', result);

      // If email verification is required, remain on this page
      if (result.needsEmailVerification) {
        setIsVerificationPending(true);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Error processing form data:', error);
      setSignupError(
        error.message || 'Something went wrong, Please try again!'
      );
    }
  };

  // Handler for checking email verification status.
  // If email is not verified, reset the signup state and redirect back to signup (step 1).
  const handleCheckVerification = async () => {
    console.log('Checking verification, global user:', globalUser);
    if (globalUser && globalUser?.data?.emailVerified) {
      // Navigate to the home route once verified.
      router.push('/');
    } else {
      alert(
        'Your email is still not verified. You will be redirected to start over.'
      );
      // Reset the signup slice (to clear the form data)
      dispatch(resetSignup());
      // Redirect the user back to the signup page (step 1)
      router.push('/sign-up');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              padding: { xs: 2, sm: 6 },
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
            }}
          >
            <Box sx={{ mb: 4 }}>
              <StepFormHeader />
              <Typography variant='body1' color='text.secondary'>
                Confirm if this is the data that you filled
              </Typography>
            </Box>
            <Paper
              elevation={2}
              sx={{
                padding: 2,
                backgroundColor: theme.palette.background.paper,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Avatar
                    sx={{
                      width: 135,
                      height: 135,
                      border: '1px solid',
                      borderColor: 'secondary',
                    }}
                    // Use the profileImage from the nested personal info.
                    src={personalInfo?.profileImage || ''}
                    alt='Profile Avatar'
                  />
                </Grid>
                {/** Render role-specific personal info (example for MANAGER and DEVELOPER) **/}
                {formData.role === 'DEVELOPER' && personalInfo && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Last Name'
                        name='lastName'
                        defaultValue={personalInfo.lastName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextInput
                        label='Contact Number'
                        name='contact'
                        defaultValue={personalInfo.contact}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </>
                )}

                {formData.role === 'MANAGER' && personalInfo && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Last Name'
                        name='lastName'
                        defaultValue={personalInfo.lastName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextInput
                        label='Contact Number'
                        name='contact'
                        defaultValue={personalInfo.contact}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </>
                )}

                {formData.role === 'ADMIN' && personalInfo && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Last Name'
                        name='lastName'
                        defaultValue={personalInfo.lastName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextInput
                        label='Contact Number'
                        name='contact'
                        defaultValue={personalInfo.contact}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </>
                )}

                {formData.role === 'SUPER_ADMIN' && personalInfo && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextInput
                        label='Last Name'
                        name='lastName'
                        defaultValue={personalInfo.lastName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextInput
                        label='Contact Number'
                        name='contact'
                        defaultValue={personalInfo.contact}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <TextInput
                    label='Username'
                    name='username'
                    defaultValue={formData.username}
                    register={register}
                    errors={errors}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    label='Email'
                    name='email'
                    defaultValue={formData.email}
                    register={register}
                    errors={errors}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    label='Role'
                    name='role'
                    defaultValue={formData.role}
                    register={register}
                    errors={errors}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    label='Password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    defaultValue={formData.password}
                    register={register}
                    errors={errors}
                    InputProps={{
                      readOnly: true,
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
                <Grid item xs={12} md={6}>
                  <TextInput
                    label='Confirm Password'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    defaultValue={formData.confirmPassword}
                    register={register}
                    errors={errors}
                    InputProps={{
                      readOnly: true,
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
            </Paper>

            {signupError && (
              <Typography variant='body2' color='error' sx={{ mt: 2 }}>
                {signupError}
              </Typography>
            )}

            {developerError && (
              <Typography variant='body2' color='error' sx={{ mt: 2 }}>
                {(developerError as any).data?.message || ''}
              </Typography>
            )}

            {managerError && (
              <Typography variant='body2' color='error' sx={{ mt: 2 }}>
                {(managerError as any).data?.message || ''}
              </Typography>
            )}

            {adminError && (
              <Typography variant='body2' color='error' sx={{ mt: 2 }}>
                {(adminError as any).data?.message || ''}
              </Typography>
            )}

            {superAdminError && (
              <Typography variant='body2' color='error' sx={{ mt: 2 }}>
                {(superAdminError as any).data?.message || ''}
              </Typography>
            )}

            {/* If email verification is pending, show a message and a button */}
            {isVerificationPending ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant='h6' color='primary' sx={{ mb: 2 }}>
                  A verification email has been sent to your email address.
                </Typography>
                <Typography variant='body1' sx={{ mb: 2 }}>
                  Please check your inbox (and spam folder) and verify your
                  account. Once verified, click the button below to continue.
                </Typography>
                <Button variant='contained' onClick={handleCheckVerification}>
                  I Have Verified My Email
                </Button>
              </Box>
            ) : (
              // Otherwise, show the navigation buttons (which include the submit button)
              <Box sx={{ mt: 3 }}>
                <Typography variant='caption' color='text.secondary'>
                  *These data can not be modified. If you want to modify data
                  you have to go back to previous step or steps.
                </Typography>
                <NavButtons />
              </Box>
            )}
          </Box>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Already have an account?{' '}
            <Link href='/sign-in' color='text.primary'>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Confirmation;
