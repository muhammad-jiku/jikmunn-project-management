"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = require("zod");
const createDeveloper = zod_1.z.object({
    body: zod_1.z
        .object({
        password: zod_1.z.string().optional(),
        username: zod_1.z.string({
            required_error: 'Username is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
        // Allow the role key and require it to be "DEVELOPER"
        role: zod_1.z.literal('DEVELOPER'),
        developer: zod_1.z
            .object({
            firstName: zod_1.z.string({
                required_error: 'First name is required',
            }),
            lastName: zod_1.z.string({
                required_error: 'Last name is required',
            }),
            middleName: zod_1.z.string().optional(),
            profileImage: zod_1.z.string().optional(),
            contact: zod_1.z.string({
                required_error: 'Contact number is required',
            }),
        })
            .strict(),
    })
        .strict(),
});
const createManager = zod_1.z.object({
    body: zod_1.z
        .object({
        password: zod_1.z.string().optional(),
        username: zod_1.z.string({
            required_error: 'Username is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
        // Allow the role key and require it to be "MANAGER"
        role: zod_1.z.literal('MANAGER'),
        manager: zod_1.z
            .object({
            firstName: zod_1.z.string({
                required_error: 'First name is required',
            }),
            lastName: zod_1.z.string({
                required_error: 'Last name is required',
            }),
            middleName: zod_1.z.string().optional(),
            profileImage: zod_1.z.string().optional(),
            contact: zod_1.z.string({
                required_error: 'Contact number is required',
            }),
        })
            .strict(),
    })
        .strict(),
});
const createAdmin = zod_1.z.object({
    body: zod_1.z
        .object({
        password: zod_1.z.string().optional(),
        username: zod_1.z.string({
            required_error: 'Username is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
        // Allow the role key and require it to be "ADMIN"
        role: zod_1.z.literal('ADMIN'),
        admin: zod_1.z
            .object({
            firstName: zod_1.z.string({
                required_error: 'First name is required',
            }),
            lastName: zod_1.z.string({
                required_error: 'Last name is required',
            }),
            middleName: zod_1.z.string().optional(),
            profileImage: zod_1.z.string().optional(),
            contact: zod_1.z.string({
                required_error: 'Contact number is required',
            }),
        })
            .strict(),
    })
        .strict(),
});
const createSuperAdmin = zod_1.z.object({
    body: zod_1.z
        .object({
        password: zod_1.z.string().optional(),
        username: zod_1.z.string({
            required_error: 'Username is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
        // Allow the role key and require it to be "SUPER_ADMIN"
        role: zod_1.z.literal('SUPER_ADMIN'),
        superAdmin: zod_1.z
            .object({
            firstName: zod_1.z.string({
                required_error: 'First name is required',
            }),
            lastName: zod_1.z.string({
                required_error: 'Last name is required',
            }),
            middleName: zod_1.z.string().optional(),
            profileImage: zod_1.z.string().optional(),
            contact: zod_1.z.string({
                required_error: 'Contact number is required',
            }),
        })
            .strict(),
    })
        .strict(),
});
exports.UserValidations = {
    createDeveloper,
    createManager,
    createAdmin,
    createSuperAdmin,
};
