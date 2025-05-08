/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
import { IGenericResponse, Manager, Pagination, SearchFilter } from '../types';

export const managersApi = createApi({
  reducerPath: 'managersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Manager'],
  endpoints: (build) => ({
    getManagers: build.query<
      IGenericResponse<Manager[]>,
      Pagination & SearchFilter
    >({
      // getManagers: build.query<
      //   IGenericResponse<any[]>,
      //   Pagination & SearchFilter
      // >({
      query: () => '/managers',
      providesTags: ['Manager'],
    }),
    getManager: build.query<Manager, string>({
      query: (id) => `/managers/${id}`,
      providesTags: ['Manager'],
    }),
    updateManager: build.mutation<
      any,
      { id: string; data: Partial<any> }
      // updateManager: build.mutation<
      //   Manager,
      //   { id: string; data: Partial<Manager> }
    >({
      query: ({ id, data }) => ({
        url: `/managers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          // const { data: managerData } = await queryFulfilled;
          // // Format the update to match the User structure
          // const userData = {
          //   data: {
          //     // Only update the manager property
          //     manager: {
          //       data: managerData.data,
          //     },
          //   },
          // };
          // dispatch(updateUserInfo(userData));
          const { data: managerData } = await queryFulfilled;
          // With our modified updateUserInfo reducer, we can simply pass the manager data
          dispatch(updateUserInfo({ manager: managerData }));
        } catch {
          // Optionally handle errors here.
        }
      },
      invalidatesTags: ['Manager'],
    }),
    deleteManager: build.mutation<Manager, string>({
      query: (id) => ({
        url: `/managers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Manager'],
    }),
  }),
});

export const {
  useGetManagersQuery,
  useGetManagerQuery,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
} = managersApi;
