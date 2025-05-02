import { z } from 'zod';

const createProjectTeam = z.object({
  body: z
    .object({
      projectId: z.number({
        required_error: 'projectId is required',
      }),
      teamId: z.number({
        required_error: 'teamId is required',
      }),
    })
    .strict(),
});

const updateProjectTeam = z.object({
  body: z
    .object({
      projectId: z.number().optional(),
      teamId: z.number().optional(),
    })
    .strict()
    .optional(),
});

export const ProjectTeamValidations = {
  createProjectTeam,
  updateProjectTeam,
};
