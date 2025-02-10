/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootState } from '@/store';
import {
  Box,
  createTheme,
  CssBaseline,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';

const Confirmation: React.FC = () => {
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);

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
      await processData(formData);
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
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
              }}
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
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    color: theme.palette.text.primary,
                  }}
                >
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </Paper>
            </Box>

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
