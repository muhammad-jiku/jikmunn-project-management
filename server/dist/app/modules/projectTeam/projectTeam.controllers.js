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
exports.ProjectTeamControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../constants/pagination");
const catchAsync_1 = require("../../../shared/catchAsync");
const pick_1 = require("../../../shared/pick");
const sendResponse_1 = require("../../../shared/sendResponse");
const projectTeam_services_1 = require("./projectTeam.services");
const insertIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = yield req.body;
        const result = yield projectTeam_services_1.ProjectTeamServices.insertIntoDB(payload);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: 'Project team association created successfully!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const getAllFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paginationOptions = (0, pick_1.pick)(req.query, pagination_1.paginationFields);
        const result = yield projectTeam_services_1.ProjectTeamServices.getAllFromDB(paginationOptions);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project team associations data retrieved successfully.',
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
        const result = yield projectTeam_services_1.ProjectTeamServices.getByIdFromDB(Number(id));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project team association data retrieved successfully!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const getByProjectIdFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.query;
        const result = yield projectTeam_services_1.ProjectTeamServices.getByProjectIdFromDB(Number(projectId));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project team associations data retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const getByTeamIdFromDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.query;
        const result = yield projectTeam_services_1.ProjectTeamServices.getByTeamIdFromDB(Number(teamId));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project team associations data retrieved successfully!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const updateOneInDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payload = yield req.body;
        const result = yield projectTeam_services_1.ProjectTeamServices.updateOneInDB(Number(id), payload);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project team association data updated successfully!',
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
        const result = yield projectTeam_services_1.ProjectTeamServices.deleteByIdFromDB(Number(id));
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Project team association data deleted successfully!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.ProjectTeamControllers = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    getByProjectIdFromDB,
    getByTeamIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
