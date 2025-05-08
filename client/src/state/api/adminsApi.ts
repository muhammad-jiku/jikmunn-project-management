/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
import { Admin, IGenericResponse, Pagination, SearchFilter } from '../types';

export const adminsApi = createApi({
  reducerPath: 'adminsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Admin'],
  endpoints: (build) => ({
    getAdmins: build.query<
      IGenericResponse<Admin[]>,
      Pagination & SearchFilter
    >({
      // getAdmins: build.query<
      //   IGenericResponse<any[]>,
      //   Pagination & SearchFilter
      // >({
      query: () => '/admins',
      providesTags: ['Admin'],
    }),
    getAdmin: build.query<Admin, string>({
      query: (id) => `/admins/${id}`,
      providesTags: ['Admin'],
    }),
    updateAdmin: build.mutation<any, { id: string; data: Partial<any> }>({
      // updateAdmin: build.mutation<Admin, { id: string; data: Partial<Admin> }>({
      query: ({ id, data }) => ({
        url: `/admins/${id}`,
        method: 'PATCH',
        body: data,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          // const { data: adminData } = await queryFulfilled;
          // // Format the update to match the User structure
          // const userData = {
          //   data: {
          //     // Only update the admin property
          //     admin: {
          //       data: adminData.data,
          //     },
          //   },
          // };
          // dispatch(updateUserInfo(userData));
          const { data: adminData } = await queryFulfilled;
          // With our modified updateUserInfo reducer, we can simply pass the admin data
          dispatch(updateUserInfo({ admin: adminData }));
        } catch {
          // Optionally handle errors here.
        }
      },
      invalidatesTags: ['Admin'],
    }),
    deleteAdmin: build.mutation<Admin, string>({
      query: (id) => ({
        url: `/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useGetAdminQuery,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminsApi;
