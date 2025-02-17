import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Developer } from '../types';

export const developersApi = createApi({
  reducerPath: 'developersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Developer'],
  endpoints: (build) => ({
    getDevelopers: build.query<Developer[], void>({
      query: () => '/developers',
      providesTags: ['Developer'],
    }),
    getDeveloper: build.query<Developer, string>({
      query: (id) => `/developers/${id}`,
      providesTags: ['Developer'],
    }),
    updateDeveloper: build.mutation<
      Developer,
      { id: string; data: Partial<Developer> }
    >({
      query: ({ id, data }) => ({
        url: `/developers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Developer'],
    }),
    deleteDeveloper: build.mutation<Developer, string>({
      query: (id) => ({
        url: `/developers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Developer'],
    }),
  }),
});

export const {
  useGetDevelopersQuery,
  useGetDeveloperQuery,
  useUpdateDeveloperMutation,
  useDeleteDeveloperMutation,
} = developersApi;
