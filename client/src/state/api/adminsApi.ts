import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
import { Admin } from '../types';

export const adminsApi = createApi({
  reducerPath: 'adminsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Admin'],
  endpoints: (build) => ({
    getAdmins: build.query<Admin[], void>({
      query: () => '/admins',
      providesTags: ['Admin'],
    }),
    getAdmin: build.query<Admin, string>({
      query: (id) => `/admins/${id}`,
      providesTags: ['Admin'],
    }),
    updateAdmin: build.mutation<Admin, { id: string; data: Partial<Admin> }>({
      query: ({ id, data }) => ({
        url: `/admins/${id}`,
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
