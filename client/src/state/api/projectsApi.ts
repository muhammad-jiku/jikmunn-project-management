import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IGenericResponse,
  NewProject,
  Pagination,
  Project,
  SearchFilter,
} from '../types';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Project'],
  endpoints: (build) => ({
    createProject: build.mutation<Project, NewProject>({
      query: (newProject) => ({
        url: '/projects/create',
        method: 'POST',
        body: newProject,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjects: build.query<
      IGenericResponse<Project[]>,
      Pagination & SearchFilter
    >({
      query: (params) => ({
        url: '/projects',
        params: params,
      }),
      providesTags: ['Project'],
    }),
    // getProjectsByUser: build.query<IGenericResponse<Project[]>, string>({
    //   query: (userId) => `/projects/me/${userId}`,
    //   providesTags: (result, error, userId) =>
    //     result
    //       ? result.data.map(({ id }) => ({ type: 'Project' as const, id }))
    //       : [{ type: 'Project' as const, id: userId }],
    // }),
    getProject: build.query<Project, number>({
      query: (id) => ({
        url: `/projects/${id}`,
      }),
      providesTags: ['Project'],
    }),
    updateProject: build.mutation<
      Project,
      { id: number; data: Partial<Project> }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: build.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    updateProjectTeams: build.mutation<
      Project,
      { projectId: number; teamIds: number[] }
    >({
      query: ({ projectId, teamIds }) => ({
        url: `/projects/teams/update`,
        method: 'POST',
        body: { projectId, teamIds },
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetProjectsQuery,
  // useGetProjectsByUserQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectTeamsMutation,
} = projectsApi;
