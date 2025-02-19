import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Pagination, SearchFilter, Task } from '../types';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Task'],
  endpoints: (build) => ({
    createTask: build.mutation<Task, { data: Task }>({
      query: (data) => ({
        url: '/tasks/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),
    getTasks: build.query<Task[], Pagination & SearchFilter>({
      query: (params) => ({
        url: '/tasks',
        params: params,
      }),
      providesTags: ['Task'],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `/tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: 'Task' as const, id }))
          : [{ type: 'Task' as const, id: userId }],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `/tasks/${taskId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
      ],
    }),
    deleteTask: build.mutation<Task, number>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetTasksQuery,
  useGetTasksByUserQuery,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = tasksApi;
