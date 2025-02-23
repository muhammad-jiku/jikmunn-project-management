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
exports.createPasswordResetToken = exports.createEmailVerificationToken = void 0;
exports.hashPassword = hashPassword;
exports.isUserExist = isUserExist;
exports.isPasswordMatch = isPasswordMatch;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../../../config"));
const prisma_1 = require("../../../shared/prisma");
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
    });
}
function isUserExist(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                userId: true,
                username: true,
                email: true,
                role: true,
                password: true,
                needsPasswordChange: true,
                emailVerified: true,
                emailVerificationToken: true,
                emailVerificationExpires: true,
                developerId: true,
                managerId: true,
                adminId: true,
                superAdminId: true,
                // developer: {
                //   select: {
                //     firstName: true,
                //     lastName: true,
                //     middleName: true,
                //     profileImage: true,
                //     contact: true,
                //   },
                // },
                // manager: {
                //   select: {
                //     firstName: true,
                //     lastName: true,
                //     middleName: true,
                //     profileImage: true,
                //     contact: true,
                //   },
                // },
                // admin: {
                //   select: {
                //     firstName: true,
                //     lastName: true,
                //     middleName: true,
                //     profileImage: true,
                //     contact: true,
                //   },
                // },
                // superAdmin: {
                //   select: {
                //     firstName: true,
                //     lastName: true,
                //     middleName: true,
                //     profileImage: true,
                //     contact: true,
                //   },
                // },
            },
        });
        return user;
    });
}
function isPasswordMatch(givenPassword, savedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Comparing passwords:', { givenPassword, savedPassword }); // Debugging logs
        return bcrypt_1.default.compare(givenPassword, savedPassword);
    });
}
const createEmailVerificationToken = () => {
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    console.log('(1) created email verification token', verificationToken);
    console.log('(1.1) created email verification hashed token', hashedToken);
    return {
        verificationToken,
        hashedToken,
    };
};
exports.createEmailVerificationToken = createEmailVerificationToken;
const createPasswordResetToken = () => {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    return {
        resetToken,
        hashedToken,
    };
};
exports.createPasswordResetToken = createPasswordResetToken;
