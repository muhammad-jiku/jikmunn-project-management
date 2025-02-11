import { resetSignup } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Avatar,
  Box,
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
import React, { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';
import TextInput from '../../FormInputs/TextInput';
import StepFormHeader from '../StepFormHeader';

const Confirmation: React.FC = () => {
  const dispatch = useDispatch();
  //  const router = useRouter();
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Compute the role-specific personal info.
  const personalInfo =
    formData.role === 'MANAGER'
      ? formData.manager
      : formData.role === 'DEVELOPER'
        ? formData.developer
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // Log final data
      console.log(JSON.stringify(formData, null, 2));
      // Reset the Redux state so that the form clears.
      dispatch(resetSignup());
      // router.push('/dashboard');
    } catch (error) {
      console.error('Error processing form data:', error);
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
                {formData.role === 'MANAGER' && personalInfo && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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

                {formData.role === 'DEVELOPER' && personalInfo && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={personalInfo.firstName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={personalInfo.middleName}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
            <Box sx={{ mt: 3 }}>
              <NavButtons />
            </Box>
          </Box>
        </form>
      </Box>
    </ThemeProvider>
  );
};

export default Confirmation;
