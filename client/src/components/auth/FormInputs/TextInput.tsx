/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from '@/store';
import {
  Box,
  createTheme,
  CssBaseline,
  TextField,
  TextFieldProps,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';

interface TextInputProps {
  label: string;
  name: string;
  register: any;
  errors: Record<string, any>;
  isRequired?: boolean;
  registerOptions?: RegisterOptions;
  type?: string;
  className?: string;
  defaultValue?: string;
  InputProps?: TextFieldProps['InputProps'];
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  register,
  errors,
  isRequired = true,
  registerOptions,
  type = 'text',
  className = 'sm:col-span-2',
  defaultValue = '',
  InputProps,
  inputProps,
}) => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);

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

  // Default register options with a default error message.
  const defaultRegisterOptions = {
    required: isRequired ? `${label} is required` : false,
  };

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
          {...register(name, { ...defaultRegisterOptions, ...registerOptions })}
          type={type}
          name={name}
          defaultValue={defaultValue}
          fullWidth
          variant='outlined'
          placeholder={`Type the ${label.toLowerCase()}`}
          error={Boolean(errors[name])}
          helperText={
            errors[name] ? errors[name].message || `${label} is required` : ''
          }
          inputProps={inputProps}
          InputProps={{
            ...InputProps,
            style: {
              color: theme.palette.text.primary,
              backgroundColor: isDarkMode
                ? 'transparent'
                : theme.palette.background.paper,
              ...(InputProps?.style || {}),
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
