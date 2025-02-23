"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSuperAdminId = exports.findLastSuperAdminId = exports.generateAdminId = exports.findLastAdminId = exports.generateManagerId = exports.findLastManagerId = exports.generateDeveloperId = exports.findLastDeveloperId = exports.validateBase64Image = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../shared/prisma");
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB in bytes
const MAX_BASE64_LENGTH = Math.ceil((MAX_FILE_SIZE_BYTES * 4) / 3);
const validateBase64Image = (base64String) => __awaiter(void 0, void 0, void 0, function* () {
    // Remove any data URL prefix if present.
    const parts = yield base64String.split(',');
    const base64Data = parts.length > 1 ? parts[1] : parts[0];
    console.log('base64Data length', base64Data.length);
    console.log('MAX_BASE64 length', MAX_BASE64_LENGTH);
    if (base64String.length > MAX_BASE64_LENGTH) {
        // Instead of throwing an error, return false.
        return false;
    }
    return true;
});
exports.validateBase64Image = validateBase64Image;
const findLastDeveloperId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastDeveloper = yield prisma_1.prisma.user.findFirst({
        where: {
            role: client_1.UserRole.DEVELOPER, // Correct usage with enum
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            developerId: true,
        },
    });
    return (lastDeveloper === null || lastDeveloper === void 0 ? void 0 : lastDeveloper.developerId)
        ? lastDeveloper === null || lastDeveloper === void 0 ? void 0 : lastDeveloper.developerId.substring(2)
        : undefined;
});
exports.findLastDeveloperId = findLastDeveloperId;
const generateDeveloperId = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentId = (yield (0, exports.findLastDeveloperId)()) || '00000';
    let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
    incrementedId = `D-${incrementedId}`;
    return incrementedId;
});
exports.generateDeveloperId = generateDeveloperId;
const findLastManagerId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastManager = yield prisma_1.prisma.user.findFirst({
        where: {
            role: client_1.UserRole.MANAGER, // Correct usage with enum
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            managerId: true,
        },
    });
    return (lastManager === null || lastManager === void 0 ? void 0 : lastManager.managerId)
        ? lastManager === null || lastManager === void 0 ? void 0 : lastManager.managerId.substring(2)
        : undefined;
});
exports.findLastManagerId = findLastManagerId;
const generateManagerId = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentId = (yield (0, exports.findLastManagerId)()) || '00000';
    let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
    incrementedId = `M-${incrementedId}`;
    return incrementedId;
});
exports.generateManagerId = generateManagerId;
const findLastAdminId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastAdmin = yield prisma_1.prisma.user.findFirst({
        where: {
            role: client_1.UserRole.ADMIN, // Correct usage with enum
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            adminId: true,
        },
    });
    return (lastAdmin === null || lastAdmin === void 0 ? void 0 : lastAdmin.adminId) ? lastAdmin === null || lastAdmin === void 0 ? void 0 : lastAdmin.adminId.substring(2) : undefined;
});
exports.findLastAdminId = findLastAdminId;
const generateAdminId = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentId = (yield (0, exports.findLastAdminId)()) || '00000';
    let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
    incrementedId = `A-${incrementedId}`;
    return incrementedId;
});
exports.generateAdminId = generateAdminId;
const findLastSuperAdminId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastSuperAdmin = yield prisma_1.prisma.user.findFirst({
        where: {
            role: client_1.UserRole.SUPER_ADMIN, // Correct usage with enum
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            superAdminId: true,
        },
    });
    return (lastSuperAdmin === null || lastSuperAdmin === void 0 ? void 0 : lastSuperAdmin.superAdminId)
        ? lastSuperAdmin === null || lastSuperAdmin === void 0 ? void 0 : lastSuperAdmin.superAdminId.substring(3)
        : undefined;
});
exports.findLastSuperAdminId = findLastSuperAdminId;
const generateSuperAdminId = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentId = (yield (0, exports.findLastSuperAdminId)()) || '00000';
    let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
    incrementedId = `SA-${incrementedId}`;
    return incrementedId;
});
exports.generateSuperAdminId = generateSuperAdminId;
