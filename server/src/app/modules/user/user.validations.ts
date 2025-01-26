import { z } from 'zod';

const createUser = z.object({
  body: z
    .object({
      cognitoId: z.string({
        required_error: 'Cognito ID is required',
      }),
      username: z.string({
        required_error: 'Username is required',
      }),
      profilePictureUrl: z.string().optional(),
      teamId: z.number().optional(),
    })
    .strict(),
});

const updateUser = z.object({
  body: z
    .object({
      cognitoId: z.string().optional(),
      username: z.string().optional(),
      profilePictureUrl: z.string().optional(),
      teamId: z.number().optional(),
    })
    .strict()
    .optional(),
});

export const UserValidations = {
  createUser,
  updateUser,
};
