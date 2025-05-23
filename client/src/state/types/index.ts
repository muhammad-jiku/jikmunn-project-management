/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ProfileData {
  firstName: string;
  lastName: string;
  middleName?: string;
  profileImage?: {
    public_id: string;
    url: string;
  };
  contact: string;
}

export interface Developer extends ProfileData {
  developerId: string;
}

export interface Manager extends ProfileData {
  managerId: string;
}

export interface Admin extends ProfileData {
  adminId: string;
}

export interface SuperAdmin extends ProfileData {
  superAdminId: string;
}

export interface User {
  data: {
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
  };
}

export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    needsEmailVerification?: boolean;
    needsPasswordChange?: boolean;
  };
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
  status?: Status;
  priority?: Priority;
  tags?: string;
  points?: number;
  startDate?: string;
  dueDate?: string;
  projectId: number;
  authorUserId?: string;
  assignedUserId?: string;
  author?: User;
  assignee?: User;
  attachments?: Attachment[];
  comments?: Comment[];
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

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

export type NewTeam = Omit<Team, 'id' | 'createdAt' | 'updatedAt'>;

export interface TeamMember {
  id?: number;
  teamId: number;
  userId: string;
}

export type NewTeamMember = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProjectTeam {
  id?: number;
  projectId: number;
  teamId: number;
}

export type NewProjectTeam = Omit<
  ProjectTeam,
  'id' | 'createdAt' | 'updatedAt'
>;

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
