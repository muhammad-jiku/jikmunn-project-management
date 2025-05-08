/* eslint-disable @typescript-eslint/no-explicit-any */
// import { persistor } from '@/store';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser, setAuthCredentials, setAuthError } from '..';
import { AuthResponse, User } from '../types';

export const checkAuthStatus = () => async (dispatch: any) => {
  try {
    // Attempt to fetch current user
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
      { credentials: 'include' }
    );

    if (response.ok) {
      const userData = await response.json();
      dispatch(
        setAuthCredentials({
          user: { data: userData }, // Ensure consistent format
          needsEmailVerification: false,
          needsPasswordChange: false,
        })
      );
      return true;
    } else {
      // Clear auth state if unable to get user
      dispatch(logoutUser());
      return false;
    }
  } catch (error) {
    console.error('Failed to check auth status:', error); // debugging log
    dispatch(logoutUser());
    return false;
  }
};

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
          if (data.data.needsEmailVerification) {
            dispatch(
              setAuthCredentials({
                user: null,
                needsEmailVerification: true,
                needsPasswordChange: data.data.needsPasswordChange || false,
              })
            );
            return;
          }

          // Otherwise, fetch the current user
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
            { credentials: 'include' }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            dispatch(
              setAuthCredentials({
                user: { data: userData }, // Ensure consistent format
                needsPasswordChange: data.data.needsPasswordChange || false,
              })
            );
          } else {
            dispatch(setAuthError('Failed to fetch user data'));
          }
        } catch (error) {
          console.error('Login error:', error); // debugging log
          dispatch(setAuthError('Authentication failed'));
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
    forgotPassword: build.mutation<
      any,
      // void,
      { email: string }
    >({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: build.mutation<
      any,
      // void,
      { token: string; newPassword: string }
    >({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    getCurrentUser: build.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    changePassword: build.mutation<
      any,
      // void,
      { oldPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    logout: build.mutation<any, void>({
      // logout: build.mutation<void, void>({
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
