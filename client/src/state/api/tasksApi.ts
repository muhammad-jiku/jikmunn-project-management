import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Pagination, Project, SearchFilter, Task, Team } from '../types';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Task', 'Project', 'Team'],
  endpoints: (build) => ({
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
  }),
});

export const { useGetTasksQuery, useGetProjectsQuery, useGetTeamsQuery } =
  tasksApi;
