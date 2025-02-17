/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Developer {
  id: string;
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
  id: string;
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
  id: string;
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
  id: string;
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
  id: number;
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
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  projectOwnerId: string;
}

export interface Team {
  id: number;
  name: string;
  teamOwnerId: string;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: string;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface SearchFilter {
  searchTerm?: string;
  [key: string]: any;
}

export enum Priority {
  Urgent = 'Urgent',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Backlog = 'Backlog',
}

export enum Status {
  ToDo = 'To Do',
  WorkInProgress = 'Work In Progress',
  UnderReview = 'Under Review',
  Completed = 'Completed',
}
