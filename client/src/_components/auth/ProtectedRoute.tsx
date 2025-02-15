/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { RootState, useAppSelector } from '@/store';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();

  // Since redux-persist adds a _persist key, we cast our state as any to access it.
  const persistState = useAppSelector(
    (state: RootState) => (state as any)._persist
  );
  const user = useAppSelector((state: RootState) => state.global.user);

  const [hasRedirected, setHasRedirected] = useState<boolean>(false);

  useEffect(() => {
    // Wait for rehydration to complete.
    if (persistState && persistState.rehydrated) {
      if (!user && !hasRedirected) {
        setHasRedirected(true);
        router.push('/sign-in');
      }
    }
  }, [user, router, persistState, hasRedirected]);

  if (!persistState || !persistState.rehydrated) {
    // While waiting for state rehydration, show a loading indicator.
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  // If rehydration is complete but there is no user, display a message before redirect.
  // if (!user) {
  //   return (
  //     <Box
  //       display='flex'
  //       justifyContent='center'
  //       alignItems='center'
  //       minHeight='100vh'
  //     >
  //       <Typography variant='h6'>Redirecting to sign in...</Typography>
  //     </Box>
  //   );
  // }

  // If the user exists, render the protected content.
  return <>{children}</>;
};

export default ProtectedRoute;
