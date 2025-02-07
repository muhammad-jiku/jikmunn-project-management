import { z } from 'zod';

const createTeam = z.object({
  body: z
    .object({
      name: z.string({
        required_error: 'Team name is required',
      }),
      teamOwnerId: z.string({
        required_error: 'Team owner ID is required',
      }),
    })
    .strict(),
});

const updateTeam = z.object({
  body: z
    .object({
      name: z.string().optional(),
      teamOwnerId: z.string().optional(),
    })
    .strict()
    .optional(),
});

export const TeamValidations = {
  createTeam,
  updateTeam,
};
