import { z } from 'zod';

const validateManagerId = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const updateManager = z.object({
  body: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      middleName: z.string().optional(),
      profileImage: z.string().optional(),
    })
    .strict()
    .optional(),
});

export const ManagerValidations = {
  validateManagerId,
  updateManager,
};
