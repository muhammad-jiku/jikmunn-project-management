/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootState } from '@/store'; // Adjust import path as needed
import {
  Box,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import NavButtons from '../../FormInputs/NavButtons';

// Define the styled components
const CodeBlock = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
  fontFamily: 'monospace',
  overflow: 'auto',
  maxHeight: '400px',
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 6),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 6),
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const Confirmation: React.FC = () => {
  const formData = useSelector((state: RootState) => state.signup.formData);
  const isDarkMode = useSelector((state: RootState) => state.global.isDarkMode);

  // Create theme based on dark mode preference
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#2563eb', // blue-600
          },
          background: {
            default: isDarkMode ? '#121212' : '#ffffff',
            paper: isDarkMode ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: isDarkMode ? '#ffffff' : '#111827', // gray-900 in light mode
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
      <Box sx={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <HeaderContainer>
              <Typography
                variant='h4'
                component='h5'
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: {
                    xs: '1.5rem',
                    md: '2rem',
                  },
                }}
              >
                Confirm and Submit Data
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Confirm if this is the data that you filled
              </Typography>
            </HeaderContainer>

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
              <CodeBlock elevation={2}>
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </CodeBlock>
            </Box>

            <Box sx={{ mt: 3 }}>
              <NavButtons />
            </Box>
          </FormContainer>
        </form>
      </Box>
    </ThemeProvider>
  );
};

export default Confirmation;
