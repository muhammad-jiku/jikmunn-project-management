"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskValidations = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createTask = zod_1.z.object({
    body: zod_1.z
        .object({
        title: zod_1.z.string({
            required_error: 'Title is required',
        }),
        description: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
        priority: zod_1.z.string().optional(),
        tags: zod_1.z.string().optional(),
        startDate: zod_1.z
            .string({
            required_error: 'Start date must be a valid date string',
        })
            .optional(),
        dueDate: zod_1.z
            .string({
            required_error: 'Due date must be a valid date string',
        })
            .optional(),
        points: zod_1.z.number().optional(),
        projectId: zod_1.z.number({
            required_error: 'Project ID is required',
        }),
        authorUserId: zod_1.z.string({
            required_error: 'Author User ID is required',
        }),
        assignedUserId: zod_1.z.string().optional(),
    })
        .strict()
        .refine((data) => {
        if (data.startDate && data.dueDate) {
            return new Date(data.startDate) < new Date(data.dueDate);
        }
        return true;
    }, {
        message: 'Due date must be after start date',
    }),
});
const updateTask = zod_1.z.object({
    body: zod_1.z
        .object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
        priority: zod_1.z.string().optional(),
        tags: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        dueDate: zod_1.z.string().optional(),
        points: zod_1.z.number().optional(),
        projectId: zod_1.z.number().optional(),
        authorUserId: zod_1.z.string().optional(),
        assignedUserId: zod_1.z.string().optional(),
    })
        .strict()
        .refine((data) => {
        if (data.startDate && data.dueDate) {
            return new Date(data.startDate) < new Date(data.dueDate);
        }
        return true;
    }, {
        message: 'Due date must be after start date',
    })
        .optional(),
});
exports.TaskValidations = {
    createTask,
    updateTask,
};
