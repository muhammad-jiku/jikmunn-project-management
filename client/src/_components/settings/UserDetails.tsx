/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useUpdateAdminMutation } from '@/state/api/adminsApi';
import { useUpdateDeveloperMutation } from '@/state/api/developersApi';
import { useUpdateManagerMutation } from '@/state/api/managersApi';
import { useUpdateSuperAdminMutation } from '@/state/api/superAdminsApi';
import { RootState } from '@/store';
import {
  Avatar,
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  IconButton,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { Pencil } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import profileDefault from '../../../public/p7.jpeg';
import TextInput from '../auth/FormInputs/TextInput';

const UserDetails: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const globalUser = useSelector((state: RootState) => state.global.user?.data);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(
    // Use an existing personal image if available or fall back to default
    globalUser?.developer?.profileImage?.url ||
      globalUser?.manager?.profileImage?.url ||
      globalUser?.admin?.profileImage?.url ||
      globalUser?.superAdmin?.profileImage?.url ||
      profileDefault.src
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [
    updateDeveloper,
    { error: developerError, isLoading: isDeveloperLoading },
  ] = useUpdateDeveloperMutation();
  const [updateManager, { error: managerError, isLoading: isManagerLoading }] =
    useUpdateManagerMutation();
  const [updateAdmin, { error: adminError, isLoading: isAdminLoading }] =
    useUpdateAdminMutation();
  const [
    updateSuperAdmin,
    { error: superAdminError, isLoading: isSuperAdminLoading },
  ] = useUpdateSuperAdminMutation();

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

  let profileData: any = {};
  if (globalUser?.role === 'DEVELOPER' && globalUser?.developer) {
    profileData = globalUser?.developer;
  } else if (globalUser?.role === 'MANAGER' && globalUser?.manager) {
    profileData = globalUser?.manager;
  } else if (globalUser?.role === 'ADMIN' && globalUser?.admin) {
    profileData = globalUser?.admin;
  } else if (globalUser?.role === 'SUPER_ADMIN' && globalUser?.superAdmin) {
    profileData = globalUser?.superAdmin;
  }

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      firstName: profileData.firstName,
      middleName: profileData.middleName,
      lastName: profileData.lastName,
      contact: profileData.contact,
      profileImage: profileData.profileImage?.url,
    },
  });

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatar(result);
        setValue('profileImage', result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission (update)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUpdateError(null);

    // Construct your update payload only from form values (do not include the event object)
    // For example, if you use react-hook-form, you might use getValues() or your own payload object.
    const payload = {
      firstName: getValues('firstName'),
      middleName: getValues('middleName'),
      lastName: getValues('lastName'),
      profileImage: getValues('profileImage'),
    };

    try {
      let result;
      if (globalUser?.role === 'DEVELOPER') {
        result = await updateDeveloper({
          id: globalUser.userId,
          data: payload,
        }).unwrap();
      } else if (globalUser?.role === 'MANAGER') {
        result = await updateManager({
          id: globalUser.userId,
          data: payload,
        }).unwrap();
      } else if (globalUser?.role === 'ADMIN') {
        result = await updateAdmin({
          id: globalUser.userId,
          data: payload,
        }).unwrap();
      } else if (globalUser?.role === 'SUPER_ADMIN') {
        result = await updateSuperAdmin({
          id: globalUser.userId,
          data: payload,
        }).unwrap();
      } else {
        throw new Error('Invalid user role');
      }
      console.log('Update successful:', result);
    } catch (error: any) {
      console.error('Error processing form data:', error);
      console.error('Error processing form data message:', error?.message);
      setUpdateError(
        error.message || 'Something went wrong, Please try again!'
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth='lg'>
        <Box
          sx={{
            width: '100%',
            mt: 8,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
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
                  color='text.primary'
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  Settings
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Here is your personal information, if you want you can update
                  your informations.
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
                {globalUser && profileData && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ position: 'relative', width: 'fit-content' }}>
                        <Avatar
                          sx={{
                            width: 135,
                            height: 135,
                            border: '1px solid',
                            borderColor: 'secondary',
                          }}
                          src={avatar}
                          alt='Profile Avatar'
                        />
                        <IconButton
                          onClick={handleAvatarClick}
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: 1,
                          }}
                        >
                          <Pencil size={20} />
                        </IconButton>
                        <input
                          type='file'
                          ref={fileInputRef}
                          accept='image/*'
                          style={{ display: 'none' }}
                          onChange={handleAvatar}
                        />
                        <input
                          type='hidden'
                          {...register('profileImage', {
                            validate: (value) =>
                              value !== profileDefault.src ||
                              'Please upload your profile image',
                          })}
                          value={avatar}
                        />
                      </Box>
                    </Grid>
                    {/* User Info */}
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='User ID'
                        name='userId'
                        defaultValue={globalUser?.userId}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                      <Typography variant='caption' color='text.secondary'>
                        User ID can not be modified.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Username'
                        name='username'
                        defaultValue={globalUser?.username}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                      <Typography variant='caption' color='text.secondary'>
                        Username can not be modified.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Email'
                        name='email'
                        defaultValue={globalUser?.email}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                      <Typography variant='caption' color='text.secondary'>
                        Email can not be modified.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Role'
                        name='role'
                        defaultValue={globalUser?.role}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                      <Typography variant='caption' color='text.secondary'>
                        Role can not be modified.
                      </Typography>
                    </Grid>
                    {/* Personal Info */}
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='First Name'
                        name='firstName'
                        defaultValue={profileData.firstName}
                        register={register}
                        errors={errors}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Middle Name'
                        name='middleName'
                        defaultValue={profileData.middleName}
                        register={register}
                        errors={errors}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Last Name'
                        name='lastName'
                        defaultValue={profileData.lastName}
                        register={register}
                        errors={errors}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label='Contact Number'
                        name='contact'
                        defaultValue={profileData.contact}
                        register={register}
                        errors={errors}
                        InputProps={{ readOnly: true }}
                      />
                      <Typography variant='caption' color='text.secondary'>
                        Contact Number can not be modified.
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
              {errors.profileImage && (
                <Typography variant='caption' color='error' sx={{ mt: 2 }}>
                  {errors.profileImage.message as string}
                </Typography>
              )}

              {updateError && (
                <Typography variant='body2' color='error' sx={{ mt: 2 }}>
                  {updateError}
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

              <Button
                type='submit'
                variant='contained'
                fullWidth
                sx={{ mt: 3 }}
                disabled={
                  isDeveloperLoading ||
                  isManagerLoading ||
                  isAdminLoading ||
                  isSuperAdminLoading
                }
              >
                {isDeveloperLoading ||
                isManagerLoading ||
                isAdminLoading ||
                isSuperAdminLoading
                  ? 'Updating...'
                  : 'Update'}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default UserDetails;
