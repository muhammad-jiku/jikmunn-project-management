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
exports.TeamServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const pagination_1 = require("../../../helpers/pagination");
const prisma_1 = require("../../../shared/prisma");
const insertIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('first project..', payload);
    // Verify team owner exists
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project owner exists
        const ownerExists = yield tx.user.findUnique({
            where: {
                userId: payload === null || payload === void 0 ? void 0 : payload.teamOwnerId,
                role: 'MANAGER',
            },
        });
        console.log('existed owner', ownerExists);
        if (!ownerExists) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team owner must be a manager and must exist!');
        }
        // Ensure the auto-increment sequence for tblteam is set correctly
        yield tx.$executeRaw `
      SELECT setval(
        pg_get_serial_sequence('tblteam', 'id'),
        (SELECT COALESCE(MAX(id), 0) FROM tblteam) + 1
      )
    `;
        const result = yield tx.team.create({
            data: payload,
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                members: true,
                projectTeams: true,
            },
        });
        console.log('result team', result);
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create team!');
        }
        return result;
    }));
});
const getAllFromDB = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = pagination_1.paginationHelpers.calculatePagination(options);
    const teams = yield prisma_1.prisma.team.findMany({
        skip,
        take: limit,
        include: {
            owner: {
                include: {
                    manager: true,
                },
            },
            members: true,
            projectTeams: true,
        },
    });
    const total = yield prisma_1.prisma.team.count();
    return {
        meta: { total, page, limit },
        data: teams,
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const team = yield prisma_1.prisma.team.findUnique({
        where: { id },
        include: {
            owner: {
                include: {
                    manager: true,
                },
            },
            members: true,
            projectTeams: true,
        },
    });
    if (!team) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team not found!');
    }
    return team;
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // If updating owner, verify new owner exists and is a manager
    if (payload.teamOwnerId) {
        const ownerExists = yield prisma_1.prisma.user.findUnique({
            where: {
                userId: payload.teamOwnerId,
                role: 'MANAGER',
            },
        });
        if (!ownerExists) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'New team owner must be a manager and must exist!');
        }
    }
    return yield prisma_1.prisma.team.update({
        where: { id },
        data: payload,
        include: {
            owner: {
                include: {
                    manager: true,
                },
            },
            members: true,
            projectTeams: true,
        },
    });
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete associated team members
        yield tx.teamMember.deleteMany({
            where: { teamId: id },
        });
        // Delete associated project teams
        yield tx.projectTeam.deleteMany({
            where: { teamId: id },
        });
        // Delete the team
        return yield tx.team.delete({
            where: { id },
        });
    }));
});
exports.TeamServices = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
