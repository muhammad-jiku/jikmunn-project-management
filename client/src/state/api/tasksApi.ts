import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IGenericResponse,
  NewTask,
  Pagination,
  SearchFilter,
  Task,
} from '../types';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Task'],
  endpoints: (build) => ({
    createTask: build.mutation<Task, NewTask>({
      query: (newTask) => ({
        url: '/tasks/create',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: ['Task'],
    }),
    getTasks: build.query<IGenericResponse<Task[]>, Pagination & SearchFilter>({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    getTasksByUser: build.query<IGenericResponse<Task[]>, string>({
      query: (userId) => `/tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.data.map(({ id }) => ({ type: 'Task' as const, id }))
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
