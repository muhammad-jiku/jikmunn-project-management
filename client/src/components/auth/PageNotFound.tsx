'use client';

import { RootState, useAppSelector } from '@/store';
import {
  Box,
  Button,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import no from '../../../public/no.gif';

function PageNotFound() {
  const isDarkMode = useAppSelector(
    (state: RootState) => state.global.isDarkMode
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
      },
    },
    typography: { fontFamily: 'inherit' },
  });

  // Define a responsive font size object
  const responsiveFontSize = { xs: '0.75rem', sm: '0.875rem', md: '1rem' };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight='100vh'
        p={2}
      >
        <Image src={no} alt={'not found'} />
        <Typography
          variant='h6'
          color='primary'
          sx={{ my: 2, fontSize: responsiveFontSize }}
        >
          This page you are looking for does not exist..!
        </Typography>
        <Link href={'/'}>
          <Button variant='contained'>Go Home.</Button>
        </Link>
      </Box>
    </ThemeProvider>
  );
}

export default PageNotFound;
