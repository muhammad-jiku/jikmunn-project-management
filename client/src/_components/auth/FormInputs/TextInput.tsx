/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from '@/store';
import {
  Box,
  createTheme,
  CssBaseline,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React from 'react';

interface TextInputProps {
  label: string;
  name: string;
  register: any;
  errors: Record<string, any>;
  isRequired?: boolean;
  type?: string;
  className?: string;
  defaultValue?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  register,
  errors,
  isRequired = true,
  type = 'text',
  className = 'sm:col-span-2',
  defaultValue = '',
}) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#93c5fd' : '#3b82f6',
          },
          grey: {
            100: isDarkMode ? '#f3f4f6' : '#374151',
            400: isDarkMode ? '#6b7280' : '#9ca3af',
            500: isDarkMode ? '#6b7280' : '#6b7280',
            900: isDarkMode ? '#f3f4f6' : '#111827',
          },
          background: {
            paper: isDarkMode ? '#1d1f21' : '#ffffff',
          },
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={className}>
        <Typography
          variant='subtitle2'
          sx={{
            color: theme.palette.grey[100],
            mb: 2,
          }}
        >
          {label}
        </Typography>
        <TextField
          {...register(name, { required: isRequired })}
          type={type}
          name={name}
          defaultValue={defaultValue}
          fullWidth
          variant='outlined'
          placeholder={`Type the ${label.toLowerCase()}`}
          error={Boolean(errors[name])}
          helperText={errors[name] && `${label} is required`}
          InputProps={{
            style: {
              color: theme.palette.text.primary,
              backgroundColor: isDarkMode
                ? 'transparent'
                : theme.palette.background.paper,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.grey[500],
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default TextInput;
