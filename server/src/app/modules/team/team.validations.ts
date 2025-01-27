import { z } from 'zod';

const createTeam = z.object({
  body: z
    .object({
      teamName: z.string({
        required_error: 'Team name is required',
      }),
      productOwnerUserId: z
        .number()
        .optional()
        .refine((id) => id === undefined || id > 0, {
          message: 'Product Owner User ID must be a positive number',
        }),
      projectManagerUserId: z
        .number()
        .optional()
        .refine((id) => id === undefined || id > 0, {
          message: 'Project Manager User ID must be a positive number',
        }),
    })
    .strict(),
});

const updateTeam = z.object({
  body: z
    .object({
      teamName: z.string().optional(),
      productOwnerUserId: z
        .number()
        .optional()
        .refine((id) => id === undefined || id > 0, {
          message: 'Product Owner User ID must be a positive number',
        }),
      projectManagerUserId: z
        .number()
        .optional()
        .refine((id) => id === undefined || id > 0, {
          message: 'Project Manager User ID must be a positive number',
        }),
    })
    .strict()
    .optional(),
});

export const TeamValidations = {
  createTeam,
  updateTeam,
};
