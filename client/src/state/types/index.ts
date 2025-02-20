/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Developer {
  id?: string;
  developerId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  profileImage?: {
    public_id: string;
    url: string;
  };
  contact: string;
}

export interface Manager {
  id?: string;
  managerId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  profileImage?: {
    public_id: string;
    url: string;
  };
  contact: string;
}

export interface Admin {
  id?: string;
  adminId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  profileImage?: {
    public_id: string;
    url: string;
  };
  contact: string;
}

export interface SuperAdmin {
  id?: string;
  superAdminId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  profileImage?: {
    public_id: string;
    url: string;
  };
  contact: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  developerId?: string;
  managerId?: string;
  adminId?: string;
  superAdminId?: string;
  needsPasswordChange?: boolean;
  emailVerified?: boolean;
  developer?: Developer;
  manager?: Manager;
  admin?: Admin;
  superAdmin?: SuperAdmin;
  authoredTasks?: Task[];
  assignedTasks?: Task[];
  ownedTeams?: Team[];
  assignedTeams?: TeamMember[];
  Project?: Project[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  needsEmailVerification?: boolean;
  needsPasswordChange?: boolean;
}

export interface SignupPayload {
  userData: {
    username: string;
    email: string;
    password: string;
  };
  profileData: {
    firstName: string;
    lastName: string;
    middleName?: string;
    contact: string;
    profileImage?: string;
  };
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: string;
  assignedUserId?: string;
  author?: User;
  assignee?: User;
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Project {
  id?: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  projectOwnerId: string;
  owner?: User;
}

export type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

export interface Team {
  id?: number;
  name: string;
  teamOwnerId: string;
}

export interface TeamMember {
  id?: number;
  teamId: number;
  userId: string;
}

export interface Attachment {
  id?: number;
  fileName: string;
  fileURL: string;
}

export interface Comment {
  id?: number;
  text: string;
  taskId: number;
  userId: string;
  task?: Task;
  user?: User;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface SearchFilter {
  searchTerm?: string;
  [key: string]: any;
}

export interface IGenericResponse<T> {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: T;
}

export enum Priority {
  Urgent = 'Urgent',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Backlog = 'Backlog',
}

export enum Status {
  TO_DO = 'TO_DO',
  WORK_IN_PROGRESS = 'WORK_IN_PROGRESS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
}
