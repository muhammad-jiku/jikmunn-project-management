"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamValidations = void 0;
const zod_1 = require("zod");
// Basic team validation schema
const createTeam = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Team name is required',
        }),
        teamOwnerId: zod_1.z.string({
            required_error: 'Team owner ID is required',
        }),
        // Optional fields for creating related entities
        members: zod_1.z
            .array(zod_1.z.object({
            userId: zod_1.z.string({
                required_error: 'Member user ID is required',
            }),
        }))
            .optional(),
        projects: zod_1.z
            .array(zod_1.z.object({
            projectId: zod_1.z.number({
                required_error: 'Project ID is required',
            }),
        }))
            .optional(),
    }),
});
// Update team validation schema
const updateTeam = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        teamOwnerId: zod_1.z.string().optional(),
        // Optional fields for updating related entities
        members: zod_1.z
            .array(zod_1.z.object({
            userId: zod_1.z.string({
                required_error: 'Member user ID is required',
            }),
            action: zod_1.z.enum(['add', 'remove'], {
                required_error: 'Action must be either "add" or "remove"',
            }),
        }))
            .optional(),
        projects: zod_1.z
            .array(zod_1.z.object({
            projectId: zod_1.z.number({
                required_error: 'Project ID is required',
            }),
            action: zod_1.z.enum(['add', 'remove'], {
                required_error: 'Action must be either "add" or "remove"',
            }),
        }))
            .optional(),
    }),
});
exports.TeamValidations = {
    createTeam,
    updateTeam,
};
