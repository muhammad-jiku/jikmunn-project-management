import { z } from 'zod';

// Create team member validation schema
const createTeamMember = z.object({
  body: z.object({
    teamId: z.number({
      required_error: 'Team ID is required',
    }),
    userId: z.string({
      required_error: 'User ID is required',
    }),
  }),
});

// Update team member validation schema
const updateTeamMember = z.object({
  body: z.object({
    teamId: z.number().optional(),
    userId: z.string().optional(),
  }),
});

// Query validation schemas
const teamIdQuery = z.object({
  query: z.object({
    teamId: z.string({
      required_error: 'Team ID is required',
    }),
  }),
});

const userIdQuery = z.object({
  query: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
  }),
});

export const TeamMemberValidations = {
  createTeamMember,
  updateTeamMember,
  teamIdQuery,
  userIdQuery,
};
