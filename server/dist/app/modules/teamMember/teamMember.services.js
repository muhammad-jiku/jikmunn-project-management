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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const pagination_1 = require("../../../helpers/pagination");
const prisma_1 = require("../../../lib/prisma");
const transactionManager_1 = require("../../../lib/transactionManager");
const insertIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if user exists
        const user = yield tx.user.findUnique({
            where: { userId: payload.userId },
        });
        if (!user) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        // Check if team exists
        const team = yield tx.team.findUnique({
            where: { id: payload.teamId },
        });
        if (!team) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team not found');
        }
        // Check if user is already a member of the team
        const existingMember = yield tx.teamMember.findFirst({
            where: {
                teamId: payload.teamId,
                userId: payload.userId,
            },
        });
        if (existingMember) {
            throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'User is already a member of this team');
        }
        // Ensure the auto-increment sequence for tblteammember is set correctly
        yield tx.$executeRaw `
      SELECT setval(
        pg_get_serial_sequence('tblteammember', 'id'),
        (SELECT COALESCE(MAX(id), 0) FROM tblteammember) + 1
      )
    `;
        // Create team member
        const teamMember = yield tx.teamMember.create({
            data: payload,
            include: {
                team: true,
                user: true,
            },
        });
        return teamMember;
    }));
});
const getAllFromDB = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = pagination_1.paginationHelpers.calculatePagination(options);
    // Use safe query wrapper for both data fetch and count
    const [teamMembers, total] = yield Promise.all([
        (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.teamMember.findMany({
            skip,
            take: limit,
            include: {
                team: true,
                user: true,
            },
        })),
        (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.teamMember.count()),
    ]);
    return {
        meta: { total, page, limit },
        data: teamMembers,
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const teamMember = yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.teamMember.findUnique({
        where: { id },
        include: {
            team: true,
            user: true,
        },
    }));
    if (!teamMember) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team member not found');
    }
    return teamMember;
});
const getByTeamIdFromDB = (teamId) => __awaiter(void 0, void 0, void 0, function* () {
    const teamMembers = yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.teamMember.findMany({
        where: { teamId },
        include: {
            user: true,
        },
    }));
    return teamMembers;
});
const getByUserIdFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const teamMembers = yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.teamMember.findMany({
        where: { userId },
        include: {
            team: true,
        },
    }));
    return teamMembers;
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if team member exists
        const existingMember = yield tx.teamMember.findUnique({
            where: { id },
            include: { team: true },
        });
        if (!existingMember) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team member not found');
        }
        // If updating user ID, check if new user exists
        if (payload.userId) {
            const newUser = yield tx.user.findUnique({
                where: { userId: payload.userId },
            });
            if (!newUser) {
                throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
            }
            // Check if the user is already a member of the team
            const duplicateMember = yield tx.teamMember.findFirst({
                where: {
                    teamId: existingMember.teamId,
                    userId: payload.userId,
                    id: { not: id },
                },
            });
            if (duplicateMember) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'User is already a member of this team');
            }
        }
        // If updating team ID, check if new team exists
        if (payload.teamId) {
            const newTeam = yield tx.team.findUnique({
                where: { id: payload.teamId },
            });
            if (!newTeam) {
                throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team not found');
            }
            // Check if the user is already a member of the new team
            const duplicateMember = yield tx.teamMember.findFirst({
                where: {
                    teamId: payload.teamId,
                    userId: existingMember.userId,
                    id: { not: id },
                },
            });
            if (duplicateMember) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'User is already a member of the new team');
            }
            // Don't allow removing the team owner
            const team = yield tx.team.findUnique({
                where: { id: existingMember.teamId },
            });
            if (team && team.teamOwnerId === existingMember.userId) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot change team for the team owner');
            }
        }
        // Update team member
        return yield tx.teamMember.update({
            where: { id },
            data: payload,
            include: {
                team: true,
                user: true,
            },
        });
    }));
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if team member exists
        const teamMember = yield tx.teamMember.findUnique({
            where: { id },
            include: { team: true },
        });
        if (!teamMember) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team member not found');
        }
        // Don't allow removing the team owner
        const team = yield tx.team.findUnique({
            where: { id: teamMember.teamId },
        });
        if (team && team.teamOwnerId === teamMember.userId) {
            throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot remove the team owner from the team');
        }
        // Delete team member
        return yield tx.teamMember.delete({
            where: { id },
        });
    }));
});
exports.TeamMemberServices = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    getByTeamIdFromDB,
    getByUserIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
