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
exports.ProjectTeamServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const pagination_1 = require("../../../helpers/pagination");
const prisma_1 = require("../../../shared/prisma");
const insertIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project exists
        const project = yield tx.project.findUnique({
            where: { id: payload.projectId },
        });
        if (!project) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
        }
        // Check if team exists
        const team = yield tx.team.findUnique({
            where: { id: payload.teamId },
            include: { members: true },
        });
        if (!team) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team not found');
        }
        // Check if project team already exists
        const existingProjectTeam = yield tx.projectTeam.findFirst({
            where: {
                projectId: payload.projectId,
                teamId: payload.teamId,
            },
        });
        if (existingProjectTeam) {
            throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Team is already assigned to this project');
        }
        // // Ensure the auto-increment sequence for tblprojectteam is set correctly
        // await tx.$executeRaw`
        //   SELECT setval(
        //     pg_get_serial_sequence('tblprojectteam', 'id'),
        //     (SELECT COALESCE(MAX(id), 0) FROM tblprojectteam) + 1
        //   )
        // `;
        // Create project team assignment
        const projectTeam = yield tx.projectTeam.create({
            data: payload,
            include: {
                project: true,
                team: {
                    include: {
                        members: true,
                        owner: true,
                    },
                },
            },
        });
        return projectTeam;
    }));
});
const getAllFromDB = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = pagination_1.paginationHelpers.calculatePagination(options);
    const projectTeams = yield prisma_1.prisma.projectTeam.findMany({
        skip,
        take: limit,
        include: {
            project: true,
            team: {
                include: {
                    members: true,
                    owner: true,
                },
            },
        },
    });
    const total = yield prisma_1.prisma.projectTeam.count();
    return {
        meta: { total, page, limit },
        data: projectTeams,
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const projectTeam = yield prisma_1.prisma.projectTeam.findUnique({
        where: { id },
        include: {
            project: true,
            team: {
                include: {
                    members: true,
                    owner: true,
                },
            },
        },
    });
    if (!projectTeam) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project team assignment not found');
    }
    return projectTeam;
});
const getByProjectIdFromDB = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const projectTeams = yield prisma_1.prisma.projectTeam.findMany({
        where: { projectId },
        include: {
            team: {
                include: {
                    members: true,
                    owner: true,
                },
            },
        },
    });
    return projectTeams;
});
const getByTeamIdFromDB = (teamId) => __awaiter(void 0, void 0, void 0, function* () {
    const projectTeams = yield prisma_1.prisma.projectTeam.findMany({
        where: { teamId },
        include: {
            project: true,
        },
    });
    return projectTeams;
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project team exists
        const existingProjectTeam = yield tx.projectTeam.findUnique({
            where: { id },
        });
        if (!existingProjectTeam) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project team assignment not found');
        }
        // If updating project ID, check if new project exists
        if (payload.projectId) {
            const newProject = yield tx.project.findUnique({
                where: { id: payload.projectId },
            });
            if (!newProject) {
                throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
            }
            // Check if the team is already assigned to the new project
            const duplicateProjectTeam = yield tx.projectTeam.findFirst({
                where: {
                    projectId: payload.projectId,
                    teamId: existingProjectTeam.teamId,
                    id: { not: id },
                },
            });
            if (duplicateProjectTeam) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Team is already assigned to the new project');
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
            // Check if the new team is already assigned to the project
            const duplicateProjectTeam = yield tx.projectTeam.findFirst({
                where: {
                    projectId: existingProjectTeam.projectId,
                    teamId: payload.teamId,
                    id: { not: id },
                },
            });
            if (duplicateProjectTeam) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'New team is already assigned to this project');
            }
        }
        // Update project team assignment
        return yield tx.projectTeam.update({
            where: { id },
            data: payload,
            include: {
                project: true,
                team: {
                    include: {
                        members: true,
                        owner: true,
                    },
                },
            },
        });
    }));
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project team exists
        const projectTeam = yield tx.projectTeam.findUnique({
            where: { id },
        });
        if (!projectTeam) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project team assignment not found');
        }
        // Delete project team assignment
        return yield tx.projectTeam.delete({
            where: { id },
        });
    }));
});
exports.ProjectTeamServices = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    getByProjectIdFromDB,
    getByTeamIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
