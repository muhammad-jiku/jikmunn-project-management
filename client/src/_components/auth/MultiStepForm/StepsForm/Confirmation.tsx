/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';
import TextInput from '../../FormInputs/TextInput';

const Confirmation: React.FC = () => {
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const {
    register,

    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...formData,
    },
    mode: 'onChange',
  });

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6', // Tailwind blue-200 and blue-500
          },
          background: {
            default: isDarkMode ? '#101214' : '#f3f4f6', // dark-bg or gray-100
            paper: isDarkMode ? '#1d1f21' : '#ffffff', // dark-secondary or white
          },
          text: {
            primary: isDarkMode ? '#f3f4f6' : '#1f2937', // gray-100 or gray-800
            secondary: isDarkMode ? '#6b7280' : '#374151', // Tailwind gray-500 or gray-700
          },
        },
      }),
    [isDarkMode]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await processData(formData); // Submitting the formData directly
    } catch (error) {
      console.error('Error processing form data:', error);
    }
  };

  const processData = async (data: any) => {
    console.log(data);
    // Add your data processing logic here
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
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: theme.palette.text.primary,
                }}
              >
                Confirm and Submit Data
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Confirm if this is the data that you filled
              </Typography>
            </Box>

            <Box
              sx={
                {
                  // display: 'grid',
                  // gap: 2,
                  // gridTemplateColumns: {
                  //   xs: '1fr',
                  //   sm: '1fr 1fr',
                  // },
                }
              }
            >
              <Paper
                elevation={2}
                sx={{
                  padding: 2,
                  backgroundColor: theme.palette.background.paper,
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                {/* <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    color: theme.palette.text.primary,
                  }}
                >
                  {JSON.stringify(formData, null, 2)}
                </pre>  */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Avatar
                      sx={{
                        width: 135,
                        height: 135,
                        border: '1px solid',
                        borderColor: 'secondary',
                      }}
                      src={formData?.profileImage}
                      alt='Profile Avatar'
                    />
                  </Grid>

                  {/* Read-Only Inputs */}
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label='First Name'
                      name='firstName'
                      defaultValue={formData?.firstName}
                      register={register}
                      errors={errors}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label='Middle Name'
                      name='middleName'
                      defaultValue={formData?.middleName}
                      register={register}
                      errors={errors}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label='Last Name'
                      name='lastName'
                      defaultValue={formData?.lastName}
                      register={register}
                      errors={errors}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextInput
                      label='Contact Number'
                      name='contact'
                      defaultValue={formData?.contact}
                      register={register}
                      errors={errors}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextInput
                      label='Username'
                      name='username'
                      defaultValue={formData?.username}
                      register={register}
                      errors={errors}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextInput
                      label='Email'
                      name='email'
                      defaultValue={formData?.email}
                      register={register}
                      errors={errors}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextInput
                      label='Role'
                      name='role'
                      defaultValue={formData?.role}
                      register={register}
                      errors={errors}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label='Password'
                      name='password'
                      type={showPassword ? 'text' : 'password'} // Show password based on toggle
                      defaultValue={formData?.password}
                      register={register}
                      errors={errors}
                      isRequired
                      InputProps={{
                        readOnly: true, // Make it readonly
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
                      type={showConfirmPassword ? 'text' : 'password'} // Show confirm password
                      defaultValue={formData?.confirmPassword}
                      register={register}
                      errors={errors}
                      isRequired
                      InputProps={{
                        readOnly: true, // Make it readonly
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
            </Box>

            {/* Submit Button */}
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
