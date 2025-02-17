// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { logoutUser, setAuthCredentials } from '.';

// export interface Pagination {
//   page?: number;
//   limit?: number;
// }

// export interface SearchFilter {
//   searchTerm?: string;
//   [key: string]: any;
// }

// export interface Developer {
//   id: string;
//   developerId: string;
//   firstName: string;
//   lastName: string;
//   middleName?: string;
//   profileImage?: {
//     public_id: string;
//     url: string;
//   };
//   contact: string;
// }

// export interface Manager {
//   id: string;
//   managerId: string;
//   firstName: string;
//   lastName: string;
//   middleName?: string;
//   profileImage?: {
//     public_id: string;
//     url: string;
//   };
//   contact: string;
// }

// export interface Admin {
//   id: string;
//   adminId: string;
//   firstName: string;
//   lastName: string;
//   middleName?: string;
//   profileImage?: {
//     public_id: string;
//     url: string;
//   };
//   contact: string;
// }

// export interface SuperAdmin {
//   id: string;
//   superAdminId: string;
//   firstName: string;
//   lastName: string;
//   middleName?: string;
//   profileImage?: {
//     public_id: string;
//     url: string;
//   };
//   contact: string;
// }

// export interface User {
//   userId: string;
//   username: string;
//   email: string;
//   role: string;
//   developerId?: string;
//   managerId?: string;
//   adminId?: string;
//   superAdminId?: string;
//   needsPasswordChange?: boolean;
//   emailVerified?: boolean;
//   developer?: Developer;
//   manager?: Manager;
//   admin?: Admin;
//   superAdmin?: SuperAdmin;
//   authoredTasks?: Task[];
//   assignedTasks?: Task[];
//   ownedTeams?: Team[];
//   assignedTeams?: TeamMember[];
//   Project?: Project[];
// }

// // Add proper auth response type to match backend
// export interface AuthResponse {
//   accessToken: string;
//   refreshToken: string;
//   needsEmailVerification?: boolean;
//   needsPasswordChange?: boolean;
// }

// export interface SignupPayload {
//   userData: {
//     username: string;
//     email: string;
//     password: string;
//   };
//   profileData: {
//     firstName: string;
//     lastName: string;
//     middleName?: string;
//     contact: string;
//     profileImage?: string;
//   };
// }

// export interface Task {
//   id: number;
//   title: string;
//   description?: string;
//   status?: string;
//   priority?: string;
//   tags?: string;
//   startDate?: string;
//   dueDate?: string;
//   points?: number;
//   projectId: number;
//   authorUserId?: string;
//   assignedUserId?: string;
// }

// export interface Project {
//   id: number;
//   title: string;
//   description?: string;
//   startDate?: string;
//   endDate?: string;
//   projectOwnerId: string;
// }

// export interface Team {
//   id: number;
//   name: string;
//   teamOwnerId: string;
// }

// export interface TeamMember {
//   id: number;
//   teamId: number;
//   userId: string;
// }

// export enum Priority {
//   Urgent = 'Urgent',
//   High = 'High',
//   Medium = 'Medium',
//   Low = 'Low',
//   Backlog = 'Backlog',
// }

// export enum Status {
//   ToDo = 'To Do',
//   WorkInProgress = 'Work In Progress',
//   UnderReview = 'Under Review',
//   Completed = 'Completed',
// }

// export const api = createApi({
//   baseQuery: fetchBaseQuery({
//     baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
//     credentials: 'include', // Include cookies in requests
//   }),
//   reducerPath: 'api',
//   tagTypes: [
//     'Task',
//     'Project',
//     'Team',
//     'Auth',
//     'Developer',
//     'Manager',
//     'Admin',
//     'SuperAdmin',
//     'User',
//   ],
//   endpoints: (build) => ({
//     // login authentication
//     login: build.mutation<AuthResponse, { email: string; password: string }>({
//       query: (credentials) => ({
//         url: '/auth/login',
//         method: 'POST',
//         body: credentials,
//       }),
//       async onQueryStarted(_, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           // If the response indicates that email verification is needed, skip fetching /auth/me.
//           if (data.needsEmailVerification) {
//             dispatch(
//               setAuthCredentials({
//                 user: null, // No fully authenticated user yet
//                 needsEmailVerification: true,
//                 needsPasswordChange: data.needsPasswordChange,
//               })
//             );
//             return;
//           }
//           // Otherwise, fetch the current user
//           const userResponse = await fetch(
//             `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
//             { credentials: 'include' }
//           );
//           const userData = await userResponse.json();
//           dispatch(
//             setAuthCredentials({
//               user: userData,
//               needsPasswordChange: data.needsPasswordChange,
//             })
//           );
//         } catch {
//           // Handle errors if needed.
//         }
//       },
//       invalidatesTags: ['Auth', 'User'],
//     }),
//     // user creations
//     signupDeveloper: build.mutation<AuthResponse, SignupPayload>({
//       query: (payload) => ({
//         url: '/users/create-developer',
//         method: 'POST',
//         body: payload,
//       }),
//       async onQueryStarted(_, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           // If the response indicates that email verification is needed, skip fetching /auth/me.
//           if (data.needsEmailVerification) {
//             dispatch(
//               setAuthCredentials({
//                 user: null, // No fully authenticated user yet
//                 needsEmailVerification: true,
//                 needsPasswordChange: data.needsPasswordChange,
//               })
//             );
//             return;
//           }
//           // Otherwise, fetch the current user
//           const userResponse = await fetch(
//             `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
//             { credentials: 'include' }
//           );
//           const userData = await userResponse.json();

//           dispatch(
//             setAuthCredentials({
//               user: userData,
//               needsPasswordChange: data.needsPasswordChange,
//             })
//           );
//         } catch {
//           // Handle errors if needed.
//         }
//       },
//       invalidatesTags: ['Auth', 'Developer', 'User'],
//     }),
//     signupManager: build.mutation<AuthResponse, SignupPayload>({
//       query: (payload) => ({
//         url: '/users/create-manager',
//         method: 'POST',
//         body: payload,
//       }),
//       async onQueryStarted(_, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           // If the response indicates that email verification is needed, skip fetching /auth/me.
//           if (data.needsEmailVerification) {
//             dispatch(
//               setAuthCredentials({
//                 user: null, // No fully authenticated user yet
//                 needsEmailVerification: true,
//                 needsPasswordChange: data.needsPasswordChange,
//               })
//             );
//             return;
//           }
//           // Otherwise, fetch the current user
//           const userResponse = await fetch(
//             `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
//             { credentials: 'include' }
//           );
//           const userData = await userResponse.json();

//           dispatch(
//             setAuthCredentials({
//               user: userData,
//               needsPasswordChange: data.needsPasswordChange,
//             })
//           );
//         } catch {
//           // Handle errors if needed.
//         }
//       },
//       invalidatesTags: ['Auth', 'Manager', 'User'],
//     }),
//     signupAdmin: build.mutation<AuthResponse, SignupPayload>({
//       query: (payload) => ({
//         url: '/users/create-admin',
//         method: 'POST',
//         body: payload,
//       }),
//       async onQueryStarted(_, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           // If the response indicates that email verification is needed, skip fetching /auth/me.
//           if (data.needsEmailVerification) {
//             dispatch(
//               setAuthCredentials({
//                 user: null, // No fully authenticated user yet
//                 needsEmailVerification: true,
//                 needsPasswordChange: data.needsPasswordChange,
//               })
//             );
//             return;
//           }
//           // Otherwise, fetch the current user
//           const userResponse = await fetch(
//             `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
//             { credentials: 'include' }
//           );
//           const userData = await userResponse.json();

//           dispatch(
//             setAuthCredentials({
//               user: userData,
//               needsPasswordChange: data.needsPasswordChange,
//             })
//           );
//         } catch {
//           // Handle errors if needed.
//         }
//       },
//       invalidatesTags: ['Auth', 'Admin', 'User'],
//     }),
//     signupSuperAdmin: build.mutation<AuthResponse, SignupPayload>({
//       query: (payload) => ({
//         url: '/users/create-super-admin',
//         method: 'POST',
//         body: payload,
//       }),
//       async onQueryStarted(_, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           // If the response indicates that email verification is needed, skip fetching /auth/me.
//           if (data.needsEmailVerification) {
//             dispatch(
//               setAuthCredentials({
//                 user: null, // No fully authenticated user yet
//                 needsEmailVerification: true,
//                 needsPasswordChange: data.needsPasswordChange,
//               })
//             );
//             return;
//           }
//           // Otherwise, fetch the current user
//           const userResponse = await fetch(
//             `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`,
//             { credentials: 'include' }
//           );
//           const userData = await userResponse.json();

//           dispatch(
//             setAuthCredentials({
//               user: userData,
//               needsPasswordChange: data.needsPasswordChange,
//             })
//           );
//         } catch {
//           // Handle errors if needed.
//         }
//       },
//       invalidatesTags: ['Auth', 'SuperAdmin', 'User'],
//     }),
//     // token authentication
//     refreshToken: build.mutation<{ accessToken: string }, void>({
//       query: () => ({
//         url: '/auth/refresh-token',
//         method: 'POST',
//       }),
//     }),
//     // email verification
//     verifyEmail: build.mutation<void, { token: string }>({
//       query: (data) => ({
//         url: '/auth/verify-email',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['User'],
//     }),
//     // forget and reset password
//     forgotPassword: build.mutation<void, { email: string }>({
//       query: (data) => ({
//         url: '/auth/forgot-password',
//         method: 'POST',
//         body: data,
//       }),
//     }),
//     resetPassword: build.mutation<void, { token: string; newPassword: string }>(
//       {
//         query: (data) => ({
//           url: '/auth/reset-password',
//           method: 'POST',
//           body: data,
//         }),
//       }
//     ),
//     // current user
//     getCurrentUser: build.query<User, void>({
//       query: () => '/auth/me',
//       providesTags: ['User'],
//     }),
//     // change password
//     changePassword: build.mutation<
//       void,
//       { oldPassword: string; newPassword: string }
//     >({
//       query: (data) => ({
//         url: '/auth/change-password',
//         method: 'POST',
//         body: data,
//       }),
//     }),
//     // developers actions
//     getDevelopers: build.query<Developer[], void>({
//       query: () => '/developers',
//       providesTags: ['Developer'],
//     }),
//     getDeveloper: build.query<Developer, string>({
//       query: (id) => `/developers/${id}`,
//       providesTags: ['Developer'],
//     }),
//     updateDeveloper: build.mutation<
//       Developer,
//       { id: string; data: Partial<Developer> }
//     >({
//       query: ({ id, data }) => ({
//         url: `/developers/${id}`,
//         method: 'PATCH',
//         body: data,
//       }),
//       invalidatesTags: ['Developer'],
//     }),
//     deleteDeveloper: build.mutation<Developer, string>({
//       query: (id) => ({
//         url: `/developers/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Developer'],
//     }),
//     // managers actions
//     getManagers: build.query<Manager[], void>({
//       query: () => '/managers',
//       providesTags: ['Manager'],
//     }),
//     getManager: build.query<Manager, string>({
//       query: (id) => `/managers/${id}`,
//       providesTags: ['Manager'],
//     }),
//     updateManager: build.mutation<
//       Manager,
//       { id: string; data: Partial<Manager> }
//     >({
//       query: ({ id, data }) => ({
//         url: `/managers/${id}`,
//         method: 'PATCH',
//         body: data,
//       }),
//       invalidatesTags: ['Manager'],
//     }),
//     deleteManager: build.mutation<Manager, string>({
//       query: (id) => ({
//         url: `/managers/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Manager'],
//     }),
//     // admins actions
//     getAdmins: build.query<Admin[], void>({
//       query: () => '/admins',
//       providesTags: ['Admin'],
//     }),
//     getAdmin: build.query<Admin, string>({
//       query: (id) => `/admins/${id}`,
//       providesTags: ['Admin'],
//     }),
//     updateAdmin: build.mutation<Admin, { id: string; data: Partial<Admin> }>({
//       query: ({ id, data }) => ({
//         url: `/admins/${id}`,
//         method: 'PATCH',
//         body: data,
//       }),
//       invalidatesTags: ['Admin'],
//     }),
//     deleteAdmin: build.mutation<Admin, string>({
//       query: (id) => ({
//         url: `/admins/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Admin'],
//     }),
//     // super admins actions
//     getSuperAdmins: build.query<SuperAdmin[], void>({
//       query: () => '/super-admins',
//       providesTags: ['SuperAdmin'],
//     }),
//     getSuperAdmin: build.query<SuperAdmin, string>({
//       query: (id) => `/super-admins/${id}`,
//       providesTags: ['SuperAdmin'],
//     }),
//     updateSuperAdmin: build.mutation<
//       SuperAdmin,
//       { id: string; data: Partial<SuperAdmin> }
//     >({
//       query: ({ id, data }) => ({
//         url: `/super-admins/${id}`,
//         method: 'PATCH',
//         body: data,
//       }),
//       invalidatesTags: ['SuperAdmin'],
//     }),
//     deleteSuperAdmin: build.mutation<SuperAdmin, string>({
//       query: (id) => ({
//         url: `/super-admins/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['SuperAdmin'],
//     }),
//     getTasks: build.query<Task[], Pagination & SearchFilter>({
//       query: (params) => ({
//         url: '/tasks',
//         params: params,
//       }),
//       providesTags: ['Task'],
//     }),
//     getProjects: build.query<Project[], Pagination & SearchFilter>({
//       query: (params) => ({
//         url: '/projects',
//         params: params,
//       }),
//       providesTags: ['Project'],
//     }),
//     getTeams: build.query<Team[], void>({
//       query: () => '/teams',
//       providesTags: ['Team'],
//     }),
//     logout: build.mutation<void, void>({
//       query: () => ({
//         url: '/auth/logout',
//         method: 'POST',
//       }),
//       async onQueryStarted(_, { dispatch }) {
//         try {
//           dispatch(logoutUser());
//         } catch {
//           // Error handling if needed
//         }
//       },
//       invalidatesTags: ['Auth', 'User'],
//     }),
//   }),
// });

// export const {
//   useLoginMutation,
//   useSignupDeveloperMutation,
//   useSignupManagerMutation,
//   useSignupAdminMutation,
//   useSignupSuperAdminMutation,
//   useRefreshTokenMutation,
//   useVerifyEmailMutation,
//   useForgotPasswordMutation,
//   useResetPasswordMutation,
//   useGetCurrentUserQuery,
//   useChangePasswordMutation,
//   // developers
//   useGetDevelopersQuery,
//   useGetDeveloperQuery,
//   useUpdateDeveloperMutation,
//   useDeleteDeveloperMutation,
//   // managers
//   useGetManagersQuery,
//   useGetManagerQuery,
//   useUpdateManagerMutation,
//   useDeleteManagerMutation,
//   // admins
//   useGetAdminsQuery,
//   useGetAdminQuery,
//   useUpdateAdminMutation,
//   useDeleteAdminMutation,
//   // super admins
//   useGetSuperAdminsQuery,
//   useGetSuperAdminQuery,
//   useUpdateSuperAdminMutation,
//   useDeleteSuperAdminMutation,
//   useGetTasksQuery,
//   useGetProjectsQuery,
//   useGetTeamsQuery,
//   useLogoutMutation,
// } = api;
