import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IGenericResponse, Pagination, SearchFilter, Team } from '../types';

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Team'],
  endpoints: (build) => ({
    createTeam: build.mutation<Team, { data: Team }>({
      query: (data) => ({
        url: '/teams/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    getTeams: build.query<IGenericResponse<Team[]>, Pagination & SearchFilter>({
      query: () => '/teams',
      providesTags: ['Team'],
    }),
    getTeam: build.query<Team, number>({
      query: (id) => `/teams/${id}`,
      providesTags: ['Team'],
    }),
    updateTeam: build.mutation<Team, { id: number; data: Partial<Team> }>({
      query: ({ id, data }) => ({
        url: `/teams/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    deleteTeam: build.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team'],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} = teamsApi;
