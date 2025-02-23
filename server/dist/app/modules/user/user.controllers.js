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
exports.UserControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../../shared/catchAsync");
const sendResponse_1 = require("../../../shared/sendResponse");
const user_services_1 = require("./user.services");
const insertDeveloperIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { developer } = _a, userData = __rest(_a, ["developer"]);
        const result = yield user_services_1.UserServices.insertDeveloperIntoDB(developer, userData, res);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: 'User created successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const insertManagerIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { manager } = _a, userData = __rest(_a, ["manager"]);
        const result = yield user_services_1.UserServices.insertManagerIntoDB(manager, userData, res);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: 'User created successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const insertAdminIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { admin } = _a, userData = __rest(_a, ["admin"]);
        const result = yield user_services_1.UserServices.insertAdminIntoDB(admin, userData, res);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: 'User created successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
const insertSuperAdminIntoDB = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { superAdmin } = _a, userData = __rest(_a, ["superAdmin"]);
        const result = yield user_services_1.UserServices.insertSuperAdminIntoDB(superAdmin, userData, res);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: 'User created successfully!!',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.UserControllers = {
    insertDeveloperIntoDB,
    insertManagerIntoDB,
    insertAdminIntoDB,
    insertSuperAdminIntoDB,
};
