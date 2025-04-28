'use client';

import { RootState } from '@/store';
import {
  Box,
  createTheme,
  CssBaseline,
  Tab,
  Tabs,
  ThemeProvider,
} from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ChangePassword from './ChangePassword';
import UserDetails from './UserDetails';

export default function SettingsProfile() {
  const [value, setValue] = useState<number>(0);
  const isDarkMode = useSelector(
    (state: RootState) => state?.global?.isDarkMode
  );

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant='scrollable'
          // scrollButtons
          allowScrollButtonsMobile
          aria-label='Profile and Password Tabs'
        >
          <Tab label='Profile' />
          <Tab label='Password' />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2 }}>
        {value === 0 && <UserDetails />}
        {value === 1 && <ChangePassword />}
      </Box>
    </ThemeProvider>
  );
}
