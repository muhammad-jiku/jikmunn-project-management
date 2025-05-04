/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IGenericResponse,
  NewTeamMember,
  Pagination,
  SearchFilter,
  TeamMember,
} from '../types';

export const teamMembersApi = createApi({
  reducerPath: 'teamMembersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['TeamMember'],
  endpoints: (build) => ({
    createTeamMember: build.mutation<TeamMember, NewTeamMember>({
      query: (newTeamMember) => ({
        url: '/team-members/create',
        method: 'POST',
        body: newTeamMember,
      }),
      invalidatesTags: ['TeamMember'],
    }),
    getTeamMembers: build.query<
      IGenericResponse<TeamMember[]>,
      Pagination & SearchFilter
    >({
      query: (params) => ({
        url: '/team-members',
        params,
      }),
      providesTags: ['TeamMember'],
    }),
    getTeamMembersByTeam: build.query<
      IGenericResponse<TeamMember[]>,
      { teamId: number }
    >({
      query: ({ teamId }) => ({
        url: '/team-members/team',
        params: { teamId },
      }),
      providesTags: ['TeamMember'],
    }),
    getTeamMembersByUser: build.query<
      IGenericResponse<TeamMember[]>,
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: '/team-members/user',
        params: { userId },
      }),
      providesTags: ['TeamMember'],
    }),
    getTeamMember: build.query<any, number>({
      // getTeamMember: build.query<TeamMember, number>({
      query: (id) => `/team-members/${id}`,
      providesTags: ['TeamMember'],
    }),
    updateTeamMember: build.mutation<
      TeamMember,
      { id: number; data: Partial<TeamMember> }
    >({
      query: ({ id, data }) => ({
        url: `/team-members/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TeamMember'],
    }),
    deleteTeamMember: build.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/team-members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeamMember'],
    }),
  }),
});

export const {
  useCreateTeamMemberMutation,
  useGetTeamMembersQuery,
  useGetTeamMembersByTeamQuery,
  useGetTeamMembersByUserQuery,
  useGetTeamMemberQuery,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamMembersApi;
