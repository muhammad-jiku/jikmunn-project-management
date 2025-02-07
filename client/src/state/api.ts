/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  tagTypes: ['User', 'Task', 'Project', 'Team'],
  endpoints: (build) => ({
    login: build.mutation<
      { accessToken: string; user: User },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    signupDeveloper: build.mutation<
      User,
      { developerData: any; userData: any }
    >({
      query: (payload) => ({
        url: '/users/create-developer',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
    signupManager: build.mutation<User, { managerData: any; userData: any }>({
      query: (payload) => ({
        url: '/users/create-manager',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
    signupAdmin: build.mutation<User, { adminData: any; userData: any }>({
      query: (payload) => ({
        url: '/users/create-admin',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
    signupSuperAdmin: build.mutation<
      User,
      { superAdminData: any; userData: any }
    >({
      query: (payload) => ({
        url: '/users/create-super-admin',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: build.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    getTasks: build.query<Task[], void>({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    getProjects: build.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getTeams: build.query<Team[], void>({
      query: () => '/teams',
      providesTags: ['Team'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupDeveloperMutation,
  useSignupManagerMutation,
  useSignupAdminMutation,
  useSignupSuperAdminMutation,
  useGetCurrentUserQuery,
  useGetTasksQuery,
  useGetProjectsQuery,
  useGetTeamsQuery,
} = api;
