/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { checkAuthStatus } from '@/state/api/authApi';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Since redux-persist adds a _persist key, we cast our state as any to access it.
  const persistState = useAppSelector(
    (state: RootState) => (state as any)._persist
  );
  const user = useAppSelector((state: RootState) => state?.global?.user?.data);
  const isAuthenticated = useAppSelector(
    (state: RootState) => state?.global?.isAuthenticated
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasRedirected, setHasRedirected] = useState<boolean>(false);

  useEffect(() => {
    // Wait for rehydration to complete before checking auth status
    if (persistState && persistState.rehydrated) {
      // If we don't have a user yet, try to fetch one
      if (!isAuthenticated) {
        // Use your new function to check auth status
        dispatch(checkAuthStatus() as any)
          .then((isAuthed: boolean) => {
            if (!isAuthed && !hasRedirected) {
              setHasRedirected(true);
              router.push('/sign-in');
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Already authenticated
        setIsLoading(false);
      }
    }
  }, [dispatch, user, isAuthenticated, router, persistState, hasRedirected]);

  // Show loading while checking auth or waiting for rehydration
  if (!persistState || !persistState.rehydrated || isLoading) {
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

  // If we're not authenticated at this point, we'll be redirecting
  if (!isAuthenticated) {
    return null;
  }

  // If the user exists, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
