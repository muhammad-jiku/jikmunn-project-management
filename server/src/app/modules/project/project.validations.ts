import { z } from 'zod';

const createProject = z.object({
  body: z
    .object({
      name: z.string({
        required_error: 'First name is required',
      }),
      description: z.string({
        required_error: 'Last name is required',
      }),
    })
    .strict(),
});

const updateProject = z.object({
  body: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
    })
    .strict()
    .optional(),
});

export const ProjectValidations = {
  createProject,
  updateProject,
};
