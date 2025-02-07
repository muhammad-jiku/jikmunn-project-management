export type ITaskFilterRequest = {
  searchTerm?: string | undefined;
  // id?: number | undefined;
  title?: string | undefined;
  description?: string | undefined;
  status?: string | undefined;
  priority?: string | undefined;
  projectId?: number | undefined;
  authorUserId?: string | undefined;
  assignedUserId?: string | undefined;
};
