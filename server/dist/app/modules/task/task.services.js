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
const prisma_1 = require("../../../shared/prisma");
const task_constants_1 = require("./task.constants");
const insertIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Task payload', payload);
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Ensure the auto-increment sequence for tbltask is set correctly
        yield tx.$executeRaw `
      SELECT setval(
        pg_get_serial_sequence('tbltask', 'id'),
        (SELECT COALESCE(MAX(id), 0) FROM tbltask) + 1
      )
    `;
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
        console.log('Result task', result);
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
    const tasks = yield prisma_1.prisma.task.findMany({
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
    });
    const total = yield prisma_1.prisma.task.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: tasks,
    };
});
const getUserTasksFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.prisma.task.findMany({
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
        });
    }
    catch (error) {
        console.error('Error retrieving user tasks:', error);
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to retrieve user tasks');
    }
});
const updateTaskStatusInDB = (taskId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield prisma_1.prisma.task.update({
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
        yield prisma_1.prisma.taskAssignment.create({
            data: {
                taskId,
                userId: task.assignedUserId || task.authorUserId,
                status,
                dueDate: task.dueDate,
            },
        });
        return task;
    }
    catch (error) {
        console.error('Error updating task status:', error);
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update task status');
    }
});
const deleteByIdFromDB = (taskId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Delete related records first
        yield prisma_1.prisma.$transaction([
            prisma_1.prisma.taskAssignment.deleteMany({ where: { taskId } }),
            prisma_1.prisma.comment.deleteMany({ where: { taskId } }),
            prisma_1.prisma.attachment.deleteMany({ where: { taskId } }),
        ]);
        return yield prisma_1.prisma.task.delete({
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
    }
    catch (error) {
        console.error('Error deleting task:', error);
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to delete task');
    }
});
exports.TaskServices = {
    insertIntoDB,
    getAllFromDB,
    getUserTasksFromDB,
    updateTaskStatusInDB,
    deleteByIdFromDB,
};
