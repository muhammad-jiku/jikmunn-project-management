/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGenericResponse, Project, Team } from '@/state/types'; // Adjust import path as needed
import { serverSideFetch } from './serverSideFetch';

export async function serverSideGetProject(
  id: number
): Promise<IGenericResponse<any>> {
  // ): Promise<IGenericResponse<Project>> {
  try {
    return await serverSideFetch<IGenericResponse<Project>>(`/projects/${id}`);
  } catch (error) {
    console.error('Server-side project fetch error:', error);
    throw error;
  }
}

export async function serverSideGetTeam(
  id: number
): Promise<IGenericResponse<any>> {
  // ): Promise<IGenericResponse<Team>> {
  try {
    return await serverSideFetch<IGenericResponse<Team>>(`/teams/${id}`);
  } catch (error) {
    console.error('Server-side team fetch error:', error);
    throw error;
  }
}
