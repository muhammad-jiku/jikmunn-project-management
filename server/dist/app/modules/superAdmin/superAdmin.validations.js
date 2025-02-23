"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminValidations = void 0;
const zod_1 = require("zod");
const updateSuperAdmin = zod_1.z.object({
    body: zod_1.z
        .object({
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        middleName: zod_1.z.string().optional(),
        profileImage: zod_1.z.string().optional(),
    })
        .strict()
        .optional(),
});
exports.SuperAdminValidations = {
    updateSuperAdmin,
};
