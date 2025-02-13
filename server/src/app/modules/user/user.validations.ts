import { z } from 'zod';

const createDeveloper = z.object({
  body: z
    .object({
      password: z.string().optional(),
      username: z.string({
        required_error: 'Username is required',
      }),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Invalid email format'),
      // Allow the role key and require it to be "DEVELOPER"
      role: z.literal('DEVELOPER'),
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
      password: z.string().optional(),
      username: z.string({
        required_error: 'Username is required',
      }),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Invalid email format'),
      // Allow the role key and require it to be "MANAGER"
      role: z.literal('MANAGER'),
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
      password: z.string().optional(),
      username: z.string({
        required_error: 'Username is required',
      }),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Invalid email format'),
      // Allow the role key and require it to be "ADMIN"
      role: z.literal('ADMIN'),
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
      password: z.string().optional(),
      username: z.string({
        required_error: 'Username is required',
      }),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Invalid email format'),
      // Allow the role key and require it to be "SUPER_ADMIN"
      role: z.literal('SUPER_ADMIN'),
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
