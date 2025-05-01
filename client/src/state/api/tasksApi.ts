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
    // getTask: build.query<any, number>({
    getTask: build.query<Task, number>({
      query: (id) => ({
        url: `/tasks/${id}`,
      }),
      providesTags: ['Task'],
    }),
    getTasksByUserProject: build.query<IGenericResponse<Task[]>, string>({
      query: (projectId) => `/tasks/project/${projectId}`,
      providesTags: (result, error, projectId) =>
        result
          ? result.data.map(({ id }) => ({ type: 'Task' as const, id }))
          : [{ type: 'Task' as const, id: projectId }],
    }),
    getTasksByUser: build.query<IGenericResponse<Task[]>, string>({
      query: (userId) => `/tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.data.map(({ id }) => ({ type: 'Task' as const, id }))
          : [{ type: 'Task' as const, id: userId }],
    }),
    updateTask: build.mutation<Task, { id: number; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `/tasks/status/${taskId}`,
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
  useGetTaskQuery,
  useGetTasksByUserProjectQuery,
  useGetTasksByUserQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = tasksApi;
