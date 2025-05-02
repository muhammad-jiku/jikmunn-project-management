import { z } from 'zod';

// Basic team validation schema
const createTeam = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Team name is required',
    }),
    teamOwnerId: z.string({
      required_error: 'Team owner ID is required',
    }),
    // Optional fields for creating related entities
    members: z
      .array(
        z.object({
          userId: z.string({
            required_error: 'Member user ID is required',
          }),
        })
      )
      .optional(),
    projects: z
      .array(
        z.object({
          projectId: z.number({
            required_error: 'Project ID is required',
          }),
        })
      )
      .optional(),
  }),
});

// Update team validation schema
const updateTeam = z.object({
  body: z.object({
    name: z.string().optional(),
    teamOwnerId: z.string().optional(),
    // Optional fields for updating related entities
    members: z
      .array(
        z.object({
          userId: z.string({
            required_error: 'Member user ID is required',
          }),
          action: z.enum(['add', 'remove'], {
            required_error: 'Action must be either "add" or "remove"',
          }),
        })
      )
      .optional(),
    projects: z
      .array(
        z.object({
          projectId: z.number({
            required_error: 'Project ID is required',
          }),
          action: z.enum(['add', 'remove'], {
            required_error: 'Action must be either "add" or "remove"',
          }),
        })
      )
      .optional(),
  }),
});

export const TeamValidations = {
  createTeam,
  updateTeam,
};
