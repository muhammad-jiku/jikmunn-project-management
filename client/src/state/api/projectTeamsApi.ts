import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IGenericResponse,
  NewProjectTeam,
  Pagination,
  ProjectTeam,
  SearchFilter,
} from '../types';

export const projectTeamsApi = createApi({
  reducerPath: 'projectTeamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['ProjectTeam'],
  endpoints: (build) => ({
    createProjectTeam: build.mutation<ProjectTeam, NewProjectTeam>({
      query: (newProjectTeam) => ({
        url: '/project-teams/create',
        method: 'POST',
        body: newProjectTeam,
      }),
      invalidatesTags: ['ProjectTeam'],
    }),
    getProjectTeams: build.query<
      IGenericResponse<ProjectTeam[]>,
      Pagination & SearchFilter
    >({
      query: (params) => ({
        url: '/project-teams',
        params,
      }),
      providesTags: ['ProjectTeam'],
    }),
    getProjectTeamsByProject: build.query<
      IGenericResponse<ProjectTeam[]>,
      { projectId: number }
    >({
      query: ({ projectId }) => ({
        url: '/project-teams/project',
        params: { projectId },
      }),
      providesTags: ['ProjectTeam'],
    }),
    getProjectTeamsByTeam: build.query<
      IGenericResponse<ProjectTeam[]>,
      { teamId: number }
    >({
      query: ({ teamId }) => ({
        url: '/project-teams/team',
        params: { teamId },
      }),
      providesTags: ['ProjectTeam'],
    }),
    getProjectTeam: build.query<ProjectTeam, number>({
      query: (id) => `/project-teams/${id}`,
      providesTags: ['ProjectTeam'],
    }),
    updateProjectTeam: build.mutation<
      ProjectTeam,
      { id: number; data: Partial<ProjectTeam> }
    >({
      query: ({ id, data }) => ({
        url: `/project-teams/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['ProjectTeam'],
    }),
    deleteProjectTeam: build.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/project-teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectTeam'],
    }),
  }),
});

export const {
  useCreateProjectTeamMutation,
  useGetProjectTeamsQuery,
  useGetProjectTeamsByProjectQuery,
  useGetProjectTeamsByTeamQuery,
  useGetProjectTeamQuery,
  useUpdateProjectTeamMutation,
  useDeleteProjectTeamMutation,
} = projectTeamsApi;
