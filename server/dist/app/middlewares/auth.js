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
exports.auth = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const handleApiError_1 = __importDefault(require("../../errors/handleApiError"));
const jwt_1 = require("../../helpers/jwt");
const auth = (...requiredRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token;
        // Cast the request to our custom interface
        const reqWithCookies = req;
        // Check for token in this order: 1. Authorization header, 2. Cookies
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (reqWithCookies.cookies && reqWithCookies.cookies.accessToken) {
            token = reqWithCookies.cookies.accessToken;
        }
        if (!token) {
            throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access');
        }
        try {
            const verifiedUser = jwt_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
            // Check if the verified user has one of the required roles
            if (requiredRoles.length &&
                !requiredRoles.includes(verifiedUser.role)) {
                throw new handleApiError_1.default(http_status_1.default.FORBIDDEN, 'Forbidden access');
            }
            req.user = verifiedUser;
            next();
        }
        catch (jwtError) {
            // If token verification fails, try to renew using refresh token
            const reqWithCookies = req;
            const refreshToken = (_a = reqWithCookies.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
            if (!refreshToken) {
                throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Authentication failed');
            }
            // You might want to implement automatic token refresh here
            // For now, just throw unauthorized
            throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Token expired');
        }
    }
    catch (error) {
        next(error);
    }
});
exports.auth = auth;
