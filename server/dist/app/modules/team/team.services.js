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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
    // Extract members and projects for later use
    const { members, projects } = payload, teamData = __rest(payload, ["members", "projects"]);
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project owner exists and is a manager
        const ownerExists = yield tx.user.findUnique({
            where: {
                userId: teamData.teamOwnerId,
                role: 'MANAGER',
            },
        });
        if (!ownerExists) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team owner must be a manager and must exist!');
        }
        // // Ensure the auto-increment sequence for tblteam is set correctly
        // await tx.$executeRaw`
        //   SELECT setval(
        //     pg_get_serial_sequence('tblteam', 'id'),
        //     (SELECT COALESCE(MAX(id), 0) FROM tblteam) + 1
        //   )
        // `;
        // Create the team
        const team = yield tx.team.create({
            data: teamData,
        });
        // If members are provided, create team members
        if (members && members.length > 0) {
            // Verify all users exist before creating members
            for (const member of members) {
                const userExists = yield tx.user.findUnique({
                    where: { userId: member.userId },
                });
                if (!userExists) {
                    throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, `User with ID ${member.userId} not found!`);
                }
            }
            // // Ensure the auto-increment sequence for tblteammember is set correctly
            // await tx.$executeRaw`
            //   SELECT setval(
            //     pg_get_serial_sequence('tblteammember', 'id'),
            //     (SELECT COALESCE(MAX(id), 0) FROM tblteammember) + 1
            //   )
            // `;
            // Create team members
            yield Promise.all(members.map((member) => tx.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: member.userId,
                },
            })));
        }
        // Add team owner as a member if not already included
        const ownerAlreadyMember = members === null || members === void 0 ? void 0 : members.some((m) => m.userId === teamData.teamOwnerId);
        if (!ownerAlreadyMember) {
            // // Ensure the auto-increment sequence for tblteammember is set correctly
            // await tx.$executeRaw`
            //   SELECT setval(
            //     pg_get_serial_sequence('tblteammember', 'id'),
            //     (SELECT COALESCE(MAX(id), 0) FROM tblteammember) + 1
            //   )
            // `;
            yield tx.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: teamData.teamOwnerId,
                },
            });
        }
        // If projects are provided, create project teams
        if (projects && projects.length > 0) {
            // Verify all projects exist before creating associations
            for (const project of projects) {
                const projectExists = yield tx.project.findUnique({
                    where: { id: project.projectId },
                });
                if (!projectExists) {
                    throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, `Project with ID ${project.projectId} not found!`);
                }
            }
            // // Ensure the auto-increment sequence for tblprojectteam is set correctly
            // await tx.$executeRaw`
            //   SELECT setval(
            //     pg_get_serial_sequence('tblprojectteam', 'id'),
            //     (SELECT COALESCE(MAX(id), 0) FROM tblprojectteam) + 1
            //   )
            // `;
            // Create project teams
            yield Promise.all(projects.map((project) => tx.projectTeam.create({
                data: {
                    teamId: team.id,
                    projectId: project.projectId,
                },
            })));
        }
        // Return the created team with all relationships included
        return (yield tx.team.findUnique({
            where: { id: team.id },
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                members: {
                    include: {
                        user: true,
                    },
                },
                projectTeams: {
                    include: {
                        project: true,
                    },
                },
            },
        }));
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
            members: {
                include: {
                    user: true,
                },
            },
            projectTeams: {
                include: {
                    project: true,
                },
            },
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
            members: {
                include: {
                    user: true,
                },
            },
            projectTeams: {
                include: {
                    project: true,
                },
            },
        },
    });
    if (!team) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team not found!');
    }
    return team;
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract members and projects for later use
    const { members, projects } = payload, teamData = __rest(payload, ["members", "projects"]);
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if team exists
        const existingTeam = yield tx.team.findUnique({
            where: { id },
            include: {
                members: true,
                projectTeams: true,
            },
        });
        if (!existingTeam) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team not found!');
        }
        // If updating owner, verify new owner exists and is a manager
        if (teamData.teamOwnerId) {
            const ownerExists = yield tx.user.findUnique({
                where: {
                    userId: teamData.teamOwnerId,
                    role: 'MANAGER',
                },
            });
            if (!ownerExists) {
                throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'New team owner must be a manager and must exist!');
            }
        }
        // Update team data if provided
        let updatedTeam = existingTeam;
        if (Object.keys(teamData).length > 0) {
            updatedTeam = yield tx.team.update({
                where: { id },
                data: teamData,
            });
        }
        // Update team members if provided
        if (members && members.length > 0) {
            for (const member of members) {
                // Check if user exists
                const userExists = yield tx.user.findUnique({
                    where: { userId: member.userId },
                });
                if (!userExists) {
                    throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, `User with ID ${member.userId} not found!`);
                }
                if (member.action === 'add') {
                    // Check if member already exists
                    const existingMember = yield tx.teamMember.findFirst({
                        where: {
                            teamId: id,
                            userId: member.userId,
                        },
                    });
                    if (!existingMember) {
                        // Add new member
                        yield tx.teamMember.create({
                            data: {
                                teamId: id,
                                userId: member.userId,
                            },
                        });
                    }
                }
                else if (member.action === 'remove') {
                    // Don't allow removing the team owner
                    if (member.userId === updatedTeam.teamOwnerId) {
                        throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot remove team owner from the team!');
                    }
                    // Remove member
                    yield tx.teamMember.deleteMany({
                        where: {
                            teamId: id,
                            userId: member.userId,
                        },
                    });
                }
            }
        }
        // Update project teams if provided
        if (projects && projects.length > 0) {
            for (const project of projects) {
                // Check if project exists
                const projectExists = yield tx.project.findUnique({
                    where: { id: project.projectId },
                });
                if (!projectExists) {
                    throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, `Project with ID ${project.projectId} not found!`);
                }
                if (project.action === 'add') {
                    // Check if project team already exists
                    const existingProjectTeam = yield tx.projectTeam.findFirst({
                        where: {
                            teamId: id,
                            projectId: project.projectId,
                        },
                    });
                    if (!existingProjectTeam) {
                        // Add new project team
                        yield tx.projectTeam.create({
                            data: {
                                teamId: id,
                                projectId: project.projectId,
                            },
                        });
                    }
                }
                else if (project.action === 'remove') {
                    // Remove project team
                    yield tx.projectTeam.deleteMany({
                        where: {
                            teamId: id,
                            projectId: project.projectId,
                        },
                    });
                }
            }
        }
        // If the team owner has changed, ensure the new owner is a member of the team
        if (teamData.teamOwnerId &&
            teamData.teamOwnerId !== existingTeam.teamOwnerId) {
            // Check if new owner is already a member
            const ownerIsMember = yield tx.teamMember.findFirst({
                where: {
                    teamId: id,
                    userId: teamData.teamOwnerId,
                },
            });
            if (!ownerIsMember) {
                // Add new owner as a member
                yield tx.teamMember.create({
                    data: {
                        teamId: id,
                        userId: teamData.teamOwnerId,
                    },
                });
            }
        }
        // Return the updated team with all relationships included
        return (yield tx.team.findUnique({
            where: { id },
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                members: {
                    include: {
                        user: true,
                    },
                },
                projectTeams: {
                    include: {
                        project: true,
                    },
                },
            },
        }));
    }));
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if team exists
        const team = yield tx.team.findUnique({
            where: { id },
        });
        if (!team) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Team not found!');
        }
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
