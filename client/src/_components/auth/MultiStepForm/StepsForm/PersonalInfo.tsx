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
import profileDefault from '../../../../../public/p7.jpeg';
import NavButtons from '../../FormInputs/NavButtons';
import TextInput from '../../FormInputs/TextInput';

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  contact: string;
  profileImage: string;
}

const PersonalInfo: React.FC = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.signup.currentStep
  );
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);
  const [avatar, setAvatar] = useState<string>(
    // Use an existing personal image if available or fall back to default
    formData.developer?.profileImage ||
      formData.manager?.profileImage ||
      formData.admin?.profileImage ||
      formData.superAdmin?.profileImage ||
      profileDefault.src
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      contact: '',
      profileImage: profileDefault.src,
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

  const processData = async (data: FormData) => {
    try {
      setLoading(true);
      // Dispatch personal info – the slice will nest these under the key
      // matching the current role (e.g. "manager" or "developer")
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
            <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
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
                    validLength: (value: string) => {
                      const digits = value.replace(/[^0-9]/g, '');
                      return (
                        (digits.length >= 7 && digits.length <= 15) ||
                        'Phone number must be between 7 and 15 digits'
                      );
                    },
                  },
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

export default PersonalInfo;
