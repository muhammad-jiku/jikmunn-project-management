/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser, setAuthCredentials } from '.';

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface SearchFilter {
  searchTerm?: string;
  [key: string]: any;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
  developerId?: string;
  managerId?: string;
  adminId?: string;
  superAdminId?: string;
  needsPasswordChange?: boolean;
  emailVerified?: boolean;
}

// Add proper auth response type to match backend
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  needsEmailVerification?: boolean;
  needsPasswordChange?: boolean;
}

export interface SignupPayload {
  userData: {
    username: string;
    email: string;
    password: string;
  };
  profileData: {
    firstName: string;
    lastName: string;
    middleName?: string;
    contact: string;
    profileImage?: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: string;
  assignedUserId?: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  projectOwnerId: string;
}

export interface Team {
  id: number;
  name: string;
  teamOwnerId: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include', // Include cookies in requests
  }),
  reducerPath: 'api',
  tagTypes: ['User', 'Task', 'Project', 'Team', 'Auth'],
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
          // Get user data after successful login
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
            {
              credentials: 'include',
            }
          );
          const userData = await userResponse.json();

          dispatch(
            setAuthCredentials({
              user: userData,
              needsPasswordChange: data.needsPasswordChange,
            })
          );
        } catch {
          // Error handling if needed
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    signupDeveloper: build.mutation<AuthResponse, SignupPayload>({
      query: (payload) => ({
        url: '/users/create-developer',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Get user data after successful signup
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
            {
              credentials: 'include',
            }
          );
          const userData = await userResponse.json();

          dispatch(
            setAuthCredentials({
              user: userData,
              needsEmailVerification: data.needsEmailVerification,
              needsPasswordChange: data.needsPasswordChange,
            })
          );
        } catch {
          // Error handling if needed
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
          // Get user data after successful signup
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
            {
              credentials: 'include',
            }
          );
          const userData = await userResponse.json();

          dispatch(
            setAuthCredentials({
              user: userData,
              needsEmailVerification: data.needsEmailVerification,
              needsPasswordChange: data.needsPasswordChange,
            })
          );
        } catch {
          // Error handling if needed
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
          // Get user data after successful signup
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
            {
              credentials: 'include',
            }
          );
          const userData = await userResponse.json();

          dispatch(
            setAuthCredentials({
              user: userData,
              needsEmailVerification: data.needsEmailVerification,
              needsPasswordChange: data.needsPasswordChange,
            })
          );
        } catch {
          // Error handling if needed
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    signupSuperAdmin: build.mutation<
      AuthResponse,
      SignupPayload
      // { developerData: any; userData: any }
    >({
      query: (payload) => ({
        url: '/users/create-super-admin',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Get user data after successful signup
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
            {
              credentials: 'include',
            }
          );
          const userData = await userResponse.json();

          dispatch(
            setAuthCredentials({
              user: userData,
              needsEmailVerification: data.needsEmailVerification,
              needsPasswordChange: data.needsPasswordChange,
            })
          );
        } catch {
          // Error handling if needed
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
    getCurrentUser: build.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    getTasks: build.query<Task[], Pagination & SearchFilter>({
      query: (params) => ({
        url: '/tasks',
        params: params,
      }),
      providesTags: ['Task'],
    }),
    getProjects: build.query<Project[], Pagination & SearchFilter>({
      query: (params) => ({
        url: '/projects',
        params: params,
      }),
      providesTags: ['Project'],
    }),
    getTeams: build.query<Team[], void>({
      query: () => '/teams',
      providesTags: ['Team'],
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
  useSignupDeveloperMutation,
  useSignupManagerMutation,
  useSignupAdminMutation,
  useSignupSuperAdminMutation,
  useRefreshTokenMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useGetTasksQuery,
  useGetProjectsQuery,
  useGetTeamsQuery,
  useLogoutMutation,
} = api;
