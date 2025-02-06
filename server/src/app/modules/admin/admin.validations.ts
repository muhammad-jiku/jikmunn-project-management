import { z } from 'zod';

const validateAdminId = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const updateAdmin = z.object({
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

export const AdminValidations = {
  validateAdminId,
  updateAdmin,
};
