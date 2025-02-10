/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from '@/store'; // Adjust the import path as needed
import { Box, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';

interface TextInputProps {
  label: string;
  name: string;
  register: any; // Replace `any` with React Hook Form types if available
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
  const theme = useTheme();

  return (
    <Box className={className}>
      <Typography
        variant='subtitle2'
        sx={{
          color: isDarkMode ? theme.palette.grey[100] : theme.palette.grey[900],
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
            color: isDarkMode
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
            backgroundColor: isDarkMode
              ? 'transparent'
              : theme.palette.background.paper,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isDarkMode
                ? theme.palette.grey[500]
                : theme.palette.grey[400],
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: isDarkMode
                ? theme.palette.grey[500]
                : theme.palette.primary.main,
            },
          },
        }}
      />
    </Box>
  );
};

export default TextInput;
