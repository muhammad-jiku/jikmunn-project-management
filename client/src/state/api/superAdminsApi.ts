/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
import {
  IGenericResponse,
  Pagination,
  SearchFilter,
  SuperAdmin,
} from '../types';

export const superAdminsApi = createApi({
  reducerPath: 'superAdminsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['SuperAdmin'],
  endpoints: (build) => ({
    getSuperAdmins: build.query<
      IGenericResponse<SuperAdmin[]>,
      Pagination & SearchFilter
    >({
      // getSuperAdmins: build.query<
      //   IGenericResponse<any[]>,
      //   Pagination & SearchFilter
      // >({
      query: () => '/super-admins',
      providesTags: ['SuperAdmin'],
    }),
    getSuperAdmin: build.query<SuperAdmin, string>({
      query: (id) => `/super-admins/${id}`,
      providesTags: ['SuperAdmin'],
    }),
    updateSuperAdmin: build.mutation<
      any,
      { id: string; data: Partial<any> }
      // updateSuperAdmin: build.mutation<
      // SuperAdmin,
      // { id: string; data: Partial<SuperAdmin> }
    >({
      query: ({ id, data }) => ({
        url: `/super-admins/${id}`,
        method: 'PATCH',
        body: data,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: superAdminData } = await queryFulfilled;
          // With our modified updateUserInfo reducer, we can simply pass the super admin data
          dispatch(updateUserInfo({ superAdmin: superAdminData }));
        } catch {
          // Optionally handle errors here.
        }
      },
      invalidatesTags: ['SuperAdmin'],
    }),
    deleteSuperAdmin: build.mutation<SuperAdmin, string>({
      query: (id) => ({
        url: `/super-admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SuperAdmin'],
    }),
  }),
});

export const {
  useGetSuperAdminsQuery,
  useGetSuperAdminQuery,
  useUpdateSuperAdminMutation,
  useDeleteSuperAdminMutation,
} = superAdminsApi;
