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
exports.ProjectServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const pagination_1 = require("../../../helpers/pagination");
const prisma_1 = require("../../../lib/prisma");
const transactionManager_1 = require("../../../lib/transactionManager");
const project_constants_1 = require("./project.constants");
// Create a new project
const insertIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project owner exists
        const ownerExists = yield tx.user.findUnique({
            where: { userId: payload.projectOwnerId },
        });
        if (!ownerExists) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project owner (manager) does not exist!');
        }
        // // Ensure the auto-increment sequence for tblproject is set correctly
        // await tx.$executeRaw`
        //   SELECT setval(
        //     pg_get_serial_sequence('tblproject', 'id'),
        //     (SELECT COALESCE(MAX(id), 0) FROM tblproject) + 1
        //   )
        // `;
        const result = yield tx.project.create({
            data: payload,
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                tasks: true,
                projectTeams: true,
            },
        });
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create project!');
        }
        return result;
    }));
});
// Get all projects with filtering and pagination
const getAllFromDB = (userId, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = pagination_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: project_constants_1.projectSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    // const whereConditions: Prisma.ProjectWhereInput = {
    //   AND: [{ projectOwnerId: userId }],
    //   ...(andConditions.length > 0 && { AND: andConditions }),
    // };
    const whereConditions = {
        OR: [
            { projectOwnerId: userId },
            ...(andConditions.length > 0 ? andConditions : []),
        ],
    };
    // Use safe query wrapper for both data fetch and count
    const [result, total] = yield Promise.all([
        (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.project.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { createdAt: 'desc' },
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                tasks: true,
                projectTeams: {
                    include: {
                        team: true,
                    },
                },
            },
        })),
        (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.project.count({
            where: whereConditions,
        })),
    ]);
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
// Get a single project by ID
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.project.findUnique({
        where: { id },
        include: {
            owner: {
                include: {
                    manager: true,
                },
            },
            tasks: true,
            projectTeams: {
                include: {
                    team: true,
                },
            },
        },
    }));
    if (!result) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Sorry, the project does not exist!');
    }
    return result;
});
// Update a project
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project exists
        const existingProject = yield tx.project.findUnique({
            where: { id },
        });
        if (!existingProject) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project not found!');
        }
        // If updating project owner, verify the new owner exists
        if (payload.owner) {
            const ownerExists = yield tx.user.findUnique({
                where: {
                    userId: payload.owner.connect
                        .userId,
                },
            });
            if (!ownerExists) {
                throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'New project owner (manager) does not exist!');
            }
        }
        const result = yield tx.project.update({
            where: { id },
            data: payload,
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                tasks: true,
                projectTeams: {
                    include: {
                        team: true,
                    },
                },
            },
        });
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.CONFLICT, 'Sorry, failed to update!');
        }
        return result;
    }));
});
// Update project teams by ID
const updateProjectTeamsById = (projectId, teamIds) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if project exists
        const existingProject = yield tx.project.findUnique({
            where: { id: projectId },
            include: {
                projectTeams: true,
            },
        });
        if (!existingProject) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project not found!');
        }
        // Delete existing team associations
        yield tx.projectTeam.deleteMany({
            where: {
                projectId,
            },
        });
        // Create new team associations
        const project = yield tx.project.update({
            where: { id: projectId },
            data: {
                projectTeams: {
                    create: teamIds.map((teamId) => ({
                        team: {
                            connect: { id: teamId },
                        },
                    })),
                },
            },
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                tasks: true,
                projectTeams: {
                    include: {
                        team: true,
                    },
                },
            },
        });
        return project;
    }));
});
// Delete a project by ID
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const project = yield tx.project.findUnique({
            where: { id },
            include: {
                tasks: true,
                projectTeams: true,
            },
        });
        if (!project) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Sorry, the project does not exist!');
        }
        // Delete related tasks
        if (project.tasks.length > 0) {
            yield tx.task.deleteMany({
                where: { projectId: id },
            });
        }
        // Delete project team associations
        if (project.projectTeams.length > 0) {
            yield tx.projectTeam.deleteMany({
                where: { projectId: id },
            });
        }
        const result = yield tx.project.delete({
            where: { id },
            include: {
                owner: {
                    include: {
                        manager: true,
                    },
                },
                tasks: true,
                projectTeams: true,
            },
        });
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.CONFLICT, 'Sorry, failed to delete!');
        }
        return result;
    }));
});
exports.ProjectServices = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    updateProjectTeamsById,
    deleteByIdFromDB,
};
