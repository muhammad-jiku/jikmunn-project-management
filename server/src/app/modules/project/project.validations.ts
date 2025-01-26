import { z } from 'zod';

const createProject = z.object({
  body: z
    .object({
      name: z.string({
        required_error: 'Name is required',
      }),
      description: z.string({
        required_error: 'Description is required',
      }),
      startDate: z.string({
        required_error: 'Start Date is required',
      }),
      endDate: z.string({
        required_error: 'End date is required',
      }),
    })
    .strict(),
});

const updateProject = z.object({
  body: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .strict()
    .optional(),
});

export const ProjectValidations = {
  createProject,
  updateProject,
};
