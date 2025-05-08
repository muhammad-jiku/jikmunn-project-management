"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTeamValidations = void 0;
const zod_1 = require("zod");
// Create project team validation schema
const createProjectTeam = zod_1.z.object({
    body: zod_1.z.object({
        projectId: zod_1.z.number({
            required_error: 'Project ID is required',
        }),
        teamId: zod_1.z.number({
            required_error: 'Team ID is required',
        }),
    }),
});
// Update project team validation schema
const updateProjectTeam = zod_1.z.object({
    body: zod_1.z.object({
        projectId: zod_1.z.number().optional(),
        teamId: zod_1.z.number().optional(),
    }),
});
// Query validation schemas
const projectIdQuery = zod_1.z.object({
    query: zod_1.z.object({
        projectId: zod_1.z.string({
            required_error: 'Project ID is required',
        }),
    }),
});
const teamIdQuery = zod_1.z.object({
    query: zod_1.z.object({
        teamId: zod_1.z.string({
            required_error: 'Team ID is required',
        }),
    }),
});
exports.ProjectTeamValidations = {
    createProjectTeam,
    updateProjectTeam,
    projectIdQuery,
    teamIdQuery,
};
