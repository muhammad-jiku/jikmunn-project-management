"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectValidations = void 0;
const zod_1 = require("zod");
const createProject = zod_1.z.object({
    body: zod_1.z
        .object({
        title: zod_1.z.string({
            required_error: 'Title is required',
        }),
        description: zod_1.z
            .string({
            required_error: 'Description is required',
        })
            .optional(),
        startDate: zod_1.z
            .string({
            required_error: 'Start date must be a valid date string',
        })
            .optional(),
        endDate: zod_1.z
            .string({
            required_error: 'End date must be a valid date string',
        })
            .optional(),
        projectOwnerId: zod_1.z.string({
            required_error: 'Project owner ID is required',
        }),
        projectTeams: zod_1.z
            .array(zod_1.z.object({
            teamId: zod_1.z.number({
                required_error: 'Team ID is required',
            }),
        }))
            .optional(),
    })
        .strict()
        .refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) < new Date(data.endDate);
        }
        return true;
    }, {
        message: 'End date must be after start date',
    }),
});
const updateProject = zod_1.z.object({
    body: zod_1.z
        .object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        projectOwnerId: zod_1.z.string().optional(),
        projectTeams: zod_1.z
            .array(zod_1.z.object({
            teamId: zod_1.z.number(),
        }))
            .optional(),
    })
        .strict()
        .refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) < new Date(data.endDate);
        }
        return true;
    }, {
        message: 'End date must be after start date',
    })
        .optional(),
});
// Validation for adding/removing teams to/from a project
const updateProjectTeams = zod_1.z.object({
    body: zod_1.z
        .object({
        projectId: zod_1.z.number({
            required_error: 'Project ID is required',
        }),
        teamIds: zod_1.z.array(zod_1.z.number({
            required_error: 'Team IDs are required',
        })),
    })
        .strict(),
});
exports.ProjectValidations = {
    createProject,
    updateProject,
    updateProjectTeams,
};
