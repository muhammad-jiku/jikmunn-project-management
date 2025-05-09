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
exports.TaskServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const pagination_1 = require("../../../helpers/pagination");
const prisma_1 = require("../../../lib/prisma");
const transactionManager_1 = require("../../../lib/transactionManager");
const task_constants_1 = require("./task.constants");
const insertIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if task owner exists
        const ownerExists = yield tx.user.findUnique({
            where: { userId: payload.authorUserId },
        });
        if (!ownerExists) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Task owner does not exist!');
        }
        // Check if task assignee exists
        const assigneeExists = yield tx.user.findUnique({
            where: { userId: payload.assignedUserId },
        });
        if (!assigneeExists) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Task assignee does not exist!');
        }
        // Check if project exists
        const projectExists = yield tx.project.findUnique({
            where: { id: payload.projectId },
        });
        if (!projectExists) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Project does not exist!');
        }
        // // Ensure the auto-increment sequence for tbltask is set correctly
        // await tx.$executeRaw`
        //   SELECT setval(
        //     pg_get_serial_sequence('tbltask', 'id'),
        //     (SELECT COALESCE(MAX(id), 0) FROM tbltask) + 1
        //   )
        // `;
        const result = yield tx.task.create({
            data: payload,
            include: {
                project: true,
                author: {
                    include: {
                        manager: true,
                        developer: true,
                    },
                },
                assignee: {
                    include: {
                        developer: true,
                    },
                },
                attachments: true,
                comments: true,
                TaskAssignment: true,
            },
        });
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create task!');
        }
        return result;
    }));
});
const getAllFromDB = (userId, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = pagination_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: task_constants_1.taskSearchableFields.map((field) => ({
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
    const whereConditions = Object.assign({ OR: [{ authorUserId: userId }, { assignedUserId: userId }] }, (andConditions.length > 0 && { AND: andConditions }));
    // Use safe query wrapper for both data fetch and count
    const [tasks, total] = yield Promise.all([
        (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.task.findMany({
            where: whereConditions,
            skip,
            take: limit,
            include: {
                project: true,
                author: {
                    include: {
                        manager: true,
                        developer: true,
                    },
                },
                assignee: {
                    include: {
                        developer: true,
                    },
                },
                attachments: true,
                comments: true,
                TaskAssignment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })),
        (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.task.count({
            where: whereConditions,
        })),
    ]);
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: tasks,
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.task.findUnique({
        where: { id },
        include: {
            project: true,
            author: {
                include: {
                    manager: true,
                    developer: true,
                },
            },
            assignee: {
                include: {
                    developer: true,
                },
            },
            attachments: true,
            comments: true,
            TaskAssignment: true,
        },
    }));
    if (!result) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Sorry, the task does not exist!');
    }
    return result;
});
const getProjectTasksFromDB = (projectId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First check if any tasks exist for this user
        const userTasks = yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.task.findMany({
            where: {
                OR: [{ authorUserId: userId }, { assignedUserId: userId }],
            },
        }));
        // If no tasks found for this user, return empty array
        if (userTasks.length === 0) {
            return [];
            // throw new ApiError(
            //   httpStatus.NOT_FOUND,
            //   'Task owner or assignee does not exist!'
            // );
        }
        // Now check if tasks exist for the specific project and user
        return yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.task.findMany({
            where: {
                AND: [
                    { projectId },
                    {
                        OR: [{ authorUserId: userId }, { assignedUserId: userId }],
                    },
                ],
            },
            include: {
                project: true,
                author: {
                    include: {
                        manager: true,
                        developer: true,
                    },
                },
                assignee: {
                    include: {
                        developer: true,
                    },
                },
                attachments: true,
                comments: true,
                TaskAssignment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }));
    }
    catch (error) {
        console.error('Error retrieving project tasks:', error); // debugging log
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to retrieve project tasks');
    }
});
const getUserTasksFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.task.findMany({
            where: {
                OR: [{ authorUserId: userId }, { assignedUserId: userId }],
            },
            include: {
                project: true,
                author: {
                    include: {
                        manager: true,
                        developer: true,
                    },
                },
                assignee: {
                    include: {
                        developer: true,
                    },
                },
                attachments: true,
                comments: true,
                TaskAssignment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }));
    }
    catch (error) {
        console.error('Error retrieving user tasks:', error); // debugging log
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to retrieve user tasks');
    }
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if task exists
        const existingTask = yield tx.task.findUnique({
            where: { id },
        });
        if (!existingTask) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Task not found!');
        }
        // If updating project author, verify the new author exists
        if (payload.authorUserId) {
            const authorExists = yield tx.user.findUnique({
                where: {
                    userId: payload.authorUserId,
                },
            });
            if (!authorExists) {
                throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'New task author does not exist!');
            }
        }
        const result = yield tx.task.update({
            where: { id },
            data: payload,
            include: {
                author: {
                    include: {
                        manager: true,
                        developer: true,
                    },
                },
                assignee: {
                    include: {
                        developer: true,
                    },
                },
                attachments: true,
                comments: true,
                TaskAssignment: true,
            },
        });
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.CONFLICT, 'Sorry, failed to update!');
        }
        return result;
    }));
});
const updateTaskStatusInDB = (taskId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const task = yield tx.task.update({
                where: { id: taskId },
                data: { status },
                include: {
                    project: true,
                    author: {
                        include: {
                            manager: true,
                            developer: true,
                        },
                    },
                    assignee: {
                        include: {
                            developer: true,
                        },
                    },
                    attachments: true,
                    comments: true,
                    TaskAssignment: true,
                },
            });
            // Create a task assignment record
            yield tx.taskAssignment.create({
                data: {
                    taskId,
                    userId: task.assignedUserId || task.authorUserId,
                    status,
                    dueDate: task.dueDate,
                },
            });
            return task;
        }));
    }
    catch (error) {
        console.error('Error updating task status:', error); // debugging log
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update task status');
    }
});
const deleteByIdFromDB = (taskId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Delete related records first
            yield tx.taskAssignment.deleteMany({ where: { taskId } });
            yield tx.comment.deleteMany({ where: { taskId } });
            yield tx.attachment.deleteMany({ where: { taskId } });
            return yield tx.task.delete({
                where: { id: taskId },
                include: {
                    project: true,
                    author: {
                        include: {
                            manager: true,
                            developer: true,
                        },
                    },
                    assignee: {
                        include: {
                            developer: true,
                        },
                    },
                },
            });
        }));
    }
    catch (error) {
        console.error('Error deleting task:', error); // debugging log
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to delete task');
    }
});
exports.TaskServices = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    getProjectTasksFromDB,
    getUserTasksFromDB,
    updateOneInDB,
    updateTaskStatusInDB,
    deleteByIdFromDB,
};
