import { z } from 'zod';

// Create project team validation schema
const createProjectTeam = z.object({
  body: z.object({
    projectId: z.number({
      required_error: 'Project ID is required',
    }),
    teamId: z.number({
      required_error: 'Team ID is required',
    }),
  }),
});

// Update project team validation schema
const updateProjectTeam = z.object({
  body: z.object({
    projectId: z.number().optional(),
    teamId: z.number().optional(),
  }),
});

// Query validation schemas
const projectIdQuery = z.object({
  query: z.object({
    projectId: z.string({
      required_error: 'Project ID is required',
    }),
  }),
});

const teamIdQuery = z.object({
  query: z.object({
    teamId: z.string({
      required_error: 'Team ID is required',
    }),
  }),
});

export const ProjectTeamValidations = {
  createProjectTeam,
  updateProjectTeam,
  projectIdQuery,
  teamIdQuery,
};
