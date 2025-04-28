/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { checkAuthStatus } from '@/state/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';

export default function InitializeAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for persisted state
  const persistState = useAppSelector((state: any) => state._persist);

  useEffect(() => {
    // Only run initialization once persisted state is rehydrated
    if (persistState?.rehydrated) {
      // Check auth status
      dispatch(checkAuthStatus() as any).finally(() => {
        setIsInitializing(false);
      });
    }
  }, [dispatch, persistState]);

  if (isInitializing && persistState?.rehydrated) {
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

  return <>{children}</>;
}
