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
exports.TaskControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../constants/pagination");
const catchAsync_1 = require("../../../shared/catchAsync");
const pick_1 = require("../../../shared/pick");
const sendResponse_1 = require("../../../shared/sendResponse");
const task_constants_1 = require("./task.constants");
const task_services_1 = require("./task.services");
const insertIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield task_services_1.TaskServices.insertIntoDB(req.body);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: 'Task created successfully',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const getAllFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const filters = (0, pick_1.pick)(req.query, task_constants_1.taskFilterableFields);
        const options = (0, pick_1.pick)(req.query, pagination_1.paginationFields);
        const result = yield task_services_1.TaskServices.getAllFromDB(user.userId, filters, options);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Tasks retrieved successfully',
            meta: result.meta,
            data: result.data,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const getByIdFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield task_services_1.TaskServices.getByIdFromDB(Number(id));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Task data fetched successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const getProjectTasksFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        const result = yield task_services_1.TaskServices.getProjectTasksFromDB(Number(id), user.userId);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "User's project tasks retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const getUserTasksFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield task_services_1.TaskServices.getUserTasksFromDB(userId);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'User tasks retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const updateInDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payload = yield req.body;
        const result = yield task_services_1.TaskServices.updateOneInDB(Number(id), payload);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Task data updated successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const updateTaskStatusInDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = yield task_services_1.TaskServices.updateTaskStatusInDB(Number(id), status);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Task status updated successfully',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const deleteByIdFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield task_services_1.TaskServices.deleteByIdFromDB(Number(id));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Task deleted successfully',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.TaskControllers = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    getProjectTasksFromDB,
    getUserTasksFromDB,
    updateInDB,
    updateTaskStatusInDB,
    deleteByIdFromDB,
};
