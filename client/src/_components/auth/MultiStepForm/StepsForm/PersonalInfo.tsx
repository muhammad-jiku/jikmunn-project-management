/* eslint-disable @typescript-eslint/no-explicit-any */
import { setCurrentStep, updateFormData } from '@/state/signupSlice';
import { RootState } from '@/store';
import {
  Avatar,
  Box,
  createTheme,
  CssBaseline,
  Grid,
  IconButton,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { Pencil } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import profile from '../../../../../public/p7.jpeg';
import NavButtons from '../../FormInputs/NavButtons';
import TextInput from '../../FormInputs/TextInput';

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  contact: string;
  profileImage: string;
  [key: string]: any;
}

const PersonalInfo: React.FC = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [avatar, setAvatar] = useState(formData.profileImage || profile);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6',
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
      }),
    [isDarkMode]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...formData,
      profileImage: formData.profileImage || profile,
    },
  });

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile instanceof Blob) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        if (reader.readyState === 2) {
          const result = reader.result as string;
          setAvatar(result);
          setValue('profileImage', result);
        }
      };
    } else {
      console.error('The selected file is not a valid Blob object.');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const processData = async (data: FormData) => {
    try {
      setLoading(true);
      dispatch(updateFormData({ ...data, profileImage: avatar }));
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
              Personal Info
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Please provide your profile details
            </Typography>
          </Box>

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
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
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
                  {...register('profileImage')}
                  value={avatar}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='First Name'
                name='firstName'
                register={register}
                errors={errors}
                isRequired
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='Middle Name'
                name='middleName'
                register={register}
                errors={errors}
                isRequired
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='Last Name'
                name='lastName'
                register={register}
                errors={errors}
                isRequired
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label='Contact Number'
                name='contact'
                type='tel'
                register={register}
                errors={errors}
                isRequired
                registerOptions={{
                  pattern: {
                    value: /^[+]?[1-9][0-9]{6,14}$/,
                    message: 'Please enter a valid phone number',
                  },
                  validate: {
                    validLength: (value: any) => {
                      const digits = value.replace(/[^0-9]/g, '');
                      if (digits.length < 7 || digits.length > 15) {
                        return 'Phone number must be between 7 and 15 digits';
                      }
                      return true;
                    },
                    // validStart: (value:any) => {
                    //   if (value.startsWith('0')) {
                    //     return 'Phone number cannot start with 0';
                    //   }
                    //   return true;
                    // },
                  },
                }}
                // inputProps={{
                //   inputMode: 'numeric',
                //   placeholder: '+1234567890',
                // }}
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

export default PersonalInfo;
