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
exports.ProjectControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../constants/pagination");
const catchAsync_1 = require("../../../shared/catchAsync");
const pick_1 = require("../../../shared/pick");
const sendResponse_1 = require("../../../shared/sendResponse");
const project_constants_1 = require("./project.constants");
const project_services_1 = require("./project.services");
const insertIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield project_services_1.ProjectServices.insertIntoDB(req.body);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: 'Project data created successfully!!',
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
        const filters = (0, pick_1.pick)(req.query, project_constants_1.projectFilterableFields);
        const options = (0, pick_1.pick)(req.query, pagination_1.paginationFields);
        const result = yield project_services_1.ProjectServices.getAllFromDB(user.userId, filters, options);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Projects data fetched successfully!!',
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
        const result = yield project_services_1.ProjectServices.getByIdFromDB(Number(id));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project data fetched successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const updateIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payload = yield req.body;
        const result = yield project_services_1.ProjectServices.updateOneInDB(Number(id), payload);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project data updated successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const updateProjectTeamsById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, teamIds } = req.body;
        const result = yield project_services_1.ProjectServices.updateProjectTeamsById(Number(projectId), teamIds);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project teams updated successfully!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const deleteFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield project_services_1.ProjectServices.deleteByIdFromDB(Number(id));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project data deleted successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.ProjectControllers = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    updateProjectTeamsById,
    deleteFromDB,
};
