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
    try {
        let token;
        console.log('token.', token);
        // Check Authorization header first
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('req headers.', req.headers);
            console.log('token...', token);
        }
        // Fallback: check for token in cookies
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
            console.log('req cookies.', req.cookies);
            console.log('token.....', token);
        }
        if (!token) {
            throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access');
        }
        const verifiedUser = jwt_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        console.log('verified user.', verifiedUser);
        // Check if the verified user has one of the required roles
        if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
            throw new handleApiError_1.default(http_status_1.default.FORBIDDEN, 'Forbidden access');
        }
        req.user = verifiedUser;
        console.log('verified user...', verifiedUser);
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.auth = auth;
