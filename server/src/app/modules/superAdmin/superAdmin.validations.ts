import { z } from 'zod';

const updateSuperAdmin = z.object({
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

export const SuperAdminValidations = {
  updateSuperAdmin,
};
