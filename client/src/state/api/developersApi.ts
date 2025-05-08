/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
import {
  Developer,
  IGenericResponse,
  Pagination,
  SearchFilter,
} from '../types';

export const developersApi = createApi({
  reducerPath: 'developersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Developer'],
  endpoints: (build) => ({
    // getDevelopers: build.query<
    //   IGenericResponse<any[]>,
    //   Pagination & SearchFilter
    // >({
    getDevelopers: build.query<
      IGenericResponse<Developer[]>,
      Pagination & SearchFilter
    >({
      query: () => '/developers',
      providesTags: ['Developer'],
    }),
    getDeveloper: build.query<Developer, string>({
      query: (id) => `/developers/${id}`,
      providesTags: ['Developer'],
    }),
    updateDeveloper: build.mutation<
      any,
      { id: string; data: Partial<any> }
      // updateDeveloper: build.mutation<
      //   Developer,
      //   { id: string; data: Partial<Developer> }
    >({
      query: ({ id, data }) => ({
        url: `/developers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: developerData } = await queryFulfilled;
          // With our modified updateUserInfo reducer, we can simply pass the developer data
          dispatch(updateUserInfo({ developer: developerData }));
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
