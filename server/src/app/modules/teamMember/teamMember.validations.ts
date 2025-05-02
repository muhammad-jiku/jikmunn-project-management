import { z } from 'zod';

const createTeamMember = z.object({
  body: z
    .object({
      teamId: z.number({
        required_error: 'Team id is required',
      }),
      userId: z.string({ required_error: 'User id is required' }),
    })
    .strict(),
});

const updateTeamMember = z.object({
  body: z
    .object({
      teamId: z.number().optional(),
      userId: z.string().optional(),
    })
    .strict()
    .optional(),
});

export const TeamMemberValidations = {
  createTeamMember,
  updateTeamMember,
};
