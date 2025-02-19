import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
import { SuperAdmin } from '../types';

export const superAdminsApi = createApi({
  reducerPath: 'superAdminsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['SuperAdmin'],
  endpoints: (build) => ({
    getSuperAdmins: build.query<SuperAdmin[], void>({
      query: () => '/super-admins',
      providesTags: ['SuperAdmin'],
    }),
    getSuperAdmin: build.query<SuperAdmin, string>({
      query: (id) => `/super-admins/${id}`,
      providesTags: ['SuperAdmin'],
    }),
    updateSuperAdmin: build.mutation<
      SuperAdmin,
      { id: string; data: Partial<SuperAdmin> }
    >({
      query: ({ id, data }) => ({
        url: `/super-admins/${id}`,
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
