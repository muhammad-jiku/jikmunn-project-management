import { persistor } from '@/store';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAuthCredentials } from '..';
import { AuthResponse, SignupPayload } from '../types';

export const usersApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Auth', 'User'],
  endpoints: (build) => ({
    signupDeveloper: build.mutation<AuthResponse, SignupPayload>({
      query: (payload) => ({
        url: '/users/create-developer',
        method: 'POST',
        body: payload,
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
    signupManager: build.mutation<AuthResponse, SignupPayload>({
      query: (payload) => ({
        url: '/users/create-manager',
        method: 'POST',
        body: payload,
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
    signupAdmin: build.mutation<AuthResponse, SignupPayload>({
      query: (payload) => ({
        url: '/users/create-admin',
        method: 'POST',
        body: payload,
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
    signupSuperAdmin: build.mutation<AuthResponse, SignupPayload>({
      query: (payload) => ({
        url: '/users/create-super-admin',
        method: 'POST',
        body: payload,
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
  }),
});

export const {
  useSignupDeveloperMutation,
  useSignupManagerMutation,
  useSignupAdminMutation,
  useSignupSuperAdminMutation,
} = usersApi;
