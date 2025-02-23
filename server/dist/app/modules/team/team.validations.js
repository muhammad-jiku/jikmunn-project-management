"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamValidations = void 0;
const zod_1 = require("zod");
const createTeam = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string({
            required_error: 'Team name is required',
        }),
        teamOwnerId: zod_1.z.string({
            required_error: 'Team owner ID is required',
        }),
    })
        .strict(),
});
const updateTeam = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        teamOwnerId: zod_1.z.string().optional(),
    })
        .strict()
        .optional(),
});
exports.TeamValidations = {
    createTeam,
    updateTeam,
};
