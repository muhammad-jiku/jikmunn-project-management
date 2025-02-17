import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { updateUserInfo } from '..';
import { Manager } from '../types';

export const managersApi = createApi({
  reducerPath: 'managersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Manager'],
  endpoints: (build) => ({
    getManagers: build.query<Manager[], void>({
      query: () => '/managers',
      providesTags: ['Manager'],
    }),
    getManager: build.query<Manager, string>({
      query: (id) => `/managers/${id}`,
      providesTags: ['Manager'],
    }),
    updateManager: build.mutation<
      Manager,
      { id: string; data: Partial<Manager> }
    >({
      query: ({ id, data }) => ({
        url: `/managers/${id}`,
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
