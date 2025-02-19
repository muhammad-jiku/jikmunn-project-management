import { persistor } from '@/store';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser, setAuthCredentials } from '..';
import { AuthResponse, User } from '../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Auth', 'User'],
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // If the response indicates that email verification is needed, skip fetching /auth/me.
          if (data.needsEmailVerification) {
            dispatch(
              setAuthCredentials({
                user: null, // No fully authenticated user yet
                needsEmailVerification: true,
                needsPasswordChange: data.needsPasswordChange,
              })
            );

            // Optionally, To clear persisted state:
            await persistor.purge();
            return;
          }
          // Otherwise, fetch the current user
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
            { credentials: 'include' }
          );
          const userData = await userResponse.json();
          dispatch(
            setAuthCredentials({
              user: userData,
              needsPasswordChange: data.needsPasswordChange,
            })
          );
        } catch {
          // Handle errors if needed.
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    refreshToken: build.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
    }),
    verifyEmail: build.mutation<void, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    forgotPassword: build.mutation<void, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: build.mutation<void, { token: string; newPassword: string }>(
      {
        query: (data) => ({
          url: '/auth/reset-password',
          method: 'POST',
          body: data,
        }),
      }
    ),
    getCurrentUser: build.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    changePassword: build.mutation<
      void,
      { oldPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch }) {
        try {
          dispatch(logoutUser());
        } catch {
          // Error handling if needed
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;
