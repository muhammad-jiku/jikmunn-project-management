import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch with the plain user object
          dispatch(updateUserInfo(data));
        } catch {
          // Optionally handle errors here.
        }
      },
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
