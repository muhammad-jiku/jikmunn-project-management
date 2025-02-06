import { z } from 'zod';

// const createUser = z.object({
//   body: z
//     .object({
//       cognitoId: z.string({
//         required_error: 'Cognito ID is required',
//       }),
//       username: z.string({
//         required_error: 'Username is required',
//       }),
//       profilePictureUrl: z.string().optional(),
//       teamId: z.number().optional(),
//     })
//     .strict(),
// });

// const updateUser = z.object({
//   body: z
//     .object({
//       cognitoId: z.string().optional(),
//       username: z.string().optional(),
//       profilePictureUrl: z.string().optional(),
//       teamId: z.number().optional(),
//     })
//     .strict()
//     .optional(),
// });

const createDeveloper = z.object({
  body: z
    .object({
      developer: z
        .object({
          firstName: z.string({
            required_error: 'First name is required',
          }),
          lastName: z.string({
            required_error: 'Last name is required',
          }),
          middleName: z.string().optional(),
          profileImage: z.string().optional(),
          username: z.string({
            required_error: 'Username is required',
          }),
          email: z
            .string({
              required_error: 'Email is required',
            })
            .email('Invalid email format'),
          contact: z.string({
            required_error: 'Contact number is required',
          }),
        })
        .strict(),
    })
    .strict(),
});

const createManager = z.object({
  body: z
    .object({
      manager: z
        .object({
          firstName: z.string({
            required_error: 'First name is required',
          }),
          lastName: z.string({
            required_error: 'Last name is required',
          }),
          middleName: z.string().optional(),
          profileImage: z.string().optional(),
          username: z.string({
            required_error: 'Username is required',
          }),
          email: z
            .string({
              required_error: 'Email is required',
            })
            .email('Invalid email format'),
          contact: z.string({
            required_error: 'Contact number is required',
          }),
        })
        .strict(),
    })
    .strict(),
});

const createAdmin = z.object({
  body: z
    .object({
      admin: z
        .object({
          firstName: z.string({
            required_error: 'First name is required',
          }),
          lastName: z.string({
            required_error: 'Last name is required',
          }),
          middleName: z.string().optional(),
          profileImage: z.string().optional(),
          username: z.string({
            required_error: 'Username is required',
          }),
          email: z
            .string({
              required_error: 'Email is required',
            })
            .email('Invalid email format'),
          contact: z.string({
            required_error: 'Contact number is required',
          }),
        })
        .strict(),
    })
    .strict(),
});

const createSuperAdmin = z.object({
  body: z
    .object({
      superAdmin: z
        .object({
          firstName: z.string({
            required_error: 'First name is required',
          }),
          lastName: z.string({
            required_error: 'Last name is required',
          }),
          middleName: z.string().optional(),
          profileImage: z.string().optional(),
          username: z.string({
            required_error: 'Username is required',
          }),
          email: z
            .string({
              required_error: 'Email is required',
            })
            .email('Invalid email format'),
          contact: z.string({
            required_error: 'Contact number is required',
          }),
        })
        .strict(),
    })
    .strict(),
});

export const UserValidations = {
  createDeveloper,
  createManager,
  createAdmin,
  createSuperAdmin,
};
