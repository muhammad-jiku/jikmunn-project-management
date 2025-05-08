"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberValidations = void 0;
const zod_1 = require("zod");
// Create team member validation schema
const createTeamMember = zod_1.z.object({
    body: zod_1.z.object({
        teamId: zod_1.z.number({
            required_error: 'Team ID is required',
        }),
        userId: zod_1.z.string({
            required_error: 'User ID is required',
        }),
    }),
});
// Update team member validation schema
const updateTeamMember = zod_1.z.object({
    body: zod_1.z.object({
        teamId: zod_1.z.number().optional(),
        userId: zod_1.z.string().optional(),
    }),
});
// Query validation schemas
const teamIdQuery = zod_1.z.object({
    query: zod_1.z.object({
        teamId: zod_1.z.string({
            required_error: 'Team ID is required',
        }),
    }),
});
const userIdQuery = zod_1.z.object({
    query: zod_1.z.object({
        userId: zod_1.z.string({
            required_error: 'User ID is required',
        }),
    }),
});
exports.TeamMemberValidations = {
    createTeamMember,
    updateTeamMember,
    teamIdQuery,
    userIdQuery,
};
