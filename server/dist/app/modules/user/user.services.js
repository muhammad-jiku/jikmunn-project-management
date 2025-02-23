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
exports.UserServices = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = __importDefault(require("cloudinary"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const jwt_1 = require("../../../helpers/jwt");
const prisma_1 = require("../../../shared/prisma");
const auth_services_1 = require("../auth/auth.services");
const auth_utils_1 = require("../auth/auth.utils");
const user_utils_1 = require("./user.utils");
// Developer creation
const insertDeveloperIntoDB = (developerData, userData, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userData.password) {
        userData.password = config_1.default.default.developer_pass;
    }
    // Hash the password before saving
    userData.password = yield (0, auth_utils_1.hashPassword)(userData.password);
    userData.role = client_1.UserRole.DEVELOPER;
    userData.username = userData.username;
    userData.email = userData.email;
    try {
        // Generate verification token using existing utility pattern
        const { verificationToken, hashedToken } = (0, auth_utils_1.createEmailVerificationToken)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Step 1: Generate a unique developer ID
        const developerId = yield (0, user_utils_1.generateDeveloperId)();
        developerData.developerId = developerId;
        console.log('developerId: ', developerId);
        // Step 2: Create Developer first to ensure the developerId exists
        // Validate and upload profile image
        // Validate the new base64 image (throws error if invalid)
        if (developerData.profileImage) {
            const isValidImage = yield (0, user_utils_1.validateBase64Image)(developerData.profileImage);
            console.log('validate base image result:', isValidImage);
            if (!isValidImage) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Image file is too large. Maximum allowed size is 2 MB.');
            }
        }
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(developerData === null || developerData === void 0 ? void 0 : developerData.profileImage, {
            folder: 'jikmunn-project-management/avatars',
            width: 150,
            crop: 'scale',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ quality: 'auto' }], // Optimize image quality
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            chunk_size: 6000000, // 6MB chunks for large uploads
            timeout: 60000, // 60 seconds timeout
            invalidate: true, // Ensure old cached versions are replaced
        });
        const newDeveloper = yield prisma_1.prisma.developer.create({
            data: Object.assign(Object.assign({}, developerData), { profileImage: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                } }),
        });
        // Step 3: Now create the User with the new developerId
        const newUser = yield prisma_1.prisma.user.create({
            data: Object.assign(Object.assign({}, userData), { userId: newDeveloper.developerId, developerId: newDeveloper.developerId, emailVerificationToken: hashedToken, emailVerificationExpires: verificationExpires }),
        });
        console.log('Developer created', newDeveloper);
        console.log('User created:', newUser);
        // Generate tokens using jwt helpers
        const accessToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
        const refreshToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
        // Set cookies
        auth_services_1.AuthServices.setAuthCookies(res, accessToken, refreshToken);
        // Send verification email
        yield auth_services_1.AuthServices.sendVerificationEmail(newUser.email, verificationToken);
        console.log('developer tokens...', { accessToken, refreshToken });
        return {
            accessToken,
            refreshToken,
            needsEmailVerification: true,
        };
    }
    catch (error) {
        console.error('Error during user creation:', error);
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create user profile');
    }
});
// Manager creation
const insertManagerIntoDB = (managerData, userData, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userData.password) {
        userData.password = config_1.default.default.manager_pass;
    }
    // Hash the password before saving
    userData.password = yield (0, auth_utils_1.hashPassword)(userData.password);
    userData.role = client_1.UserRole.MANAGER;
    userData.username = userData.username;
    userData.email = userData.email;
    try {
        // Generate verification token using existing utility pattern
        const { verificationToken, hashedToken } = (0, auth_utils_1.createEmailVerificationToken)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Step 1: Generate a unique manager ID
        const managerId = yield (0, user_utils_1.generateManagerId)();
        managerData.managerId = managerId;
        console.log('managerId: ', managerId);
        // Step 2: Create Manager first to ensure the managerId exists
        // Validate and upload profile image
        // Validate the new base64 image (throws error if invalid)
        if (managerData.profileImage) {
            const isValidImage = yield (0, user_utils_1.validateBase64Image)(managerData.profileImage);
            console.log('validate base image result:', isValidImage);
            if (!isValidImage) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Image file is too large. Maximum allowed size is 2 MB.');
            }
        }
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(managerData === null || managerData === void 0 ? void 0 : managerData.profileImage, {
            folder: 'jikmunn-project-management/avatars',
            width: 150,
            crop: 'scale',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ quality: 'auto' }], // Optimize image quality
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            chunk_size: 6000000, // 6MB chunks for large uploads
            timeout: 60000, // 60 seconds timeout
            invalidate: true, // Ensure old cached versions are replaced
        });
        const newManager = yield prisma_1.prisma.manager.create({
            data: Object.assign(Object.assign({}, managerData), { profileImage: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                } }),
        });
        // Step 3: Now create the User with the new managerId
        const newUser = yield prisma_1.prisma.user.create({
            data: Object.assign(Object.assign({}, userData), { userId: newManager.managerId, managerId: newManager.managerId, emailVerificationToken: hashedToken, emailVerificationExpires: verificationExpires }),
        });
        console.log('Manager created', newManager);
        console.log('User created:', newUser);
        // Generate tokens using jwt helpers
        const accessToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
        const refreshToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
        // Set cookies
        auth_services_1.AuthServices.setAuthCookies(res, accessToken, refreshToken);
        // Send verification email
        yield auth_services_1.AuthServices.sendVerificationEmail(newUser.email, verificationToken);
        console.log('manager tokens...', { accessToken, refreshToken });
        return {
            accessToken,
            refreshToken,
            needsEmailVerification: true,
        };
    }
    catch (error) {
        console.error('Error during user creation:', error);
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create user profile');
    }
});
// Admin creation
const insertAdminIntoDB = (adminData, userData, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userData.password) {
        userData.password = config_1.default.default.admin_pass;
    }
    // Hash the password before saving
    userData.password = yield (0, auth_utils_1.hashPassword)(userData.password);
    userData.role = client_1.UserRole.ADMIN;
    userData.username = userData.username;
    userData.email = userData.email;
    try {
        // Generate verification token using existing utility pattern
        const { verificationToken, hashedToken } = (0, auth_utils_1.createEmailVerificationToken)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Step 1: Generate a unique admin ID
        const adminId = yield (0, user_utils_1.generateAdminId)();
        adminData.adminId = adminId;
        console.log('adminId: ', adminId);
        // Step 2: Create Admin first to ensure the adminId exists
        // Validate and upload profile image
        // Validate the new base64 image (throws error if invalid)
        if (adminData.profileImage) {
            const isValidImage = yield (0, user_utils_1.validateBase64Image)(adminData.profileImage);
            console.log('validate base image result:', isValidImage);
            if (!isValidImage) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Image file is too large. Maximum allowed size is 2 MB.');
            }
        }
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(adminData === null || adminData === void 0 ? void 0 : adminData.profileImage, {
            folder: 'jikmunn-project-management/avatars',
            width: 150,
            crop: 'scale',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ quality: 'auto' }], // Optimize image quality
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            chunk_size: 6000000, // 6MB chunks for large uploads
            timeout: 60000, // 60 seconds timeout
            invalidate: true, // Ensure old cached versions are replaced
        });
        const newAdmin = yield prisma_1.prisma.admin.create({
            data: Object.assign(Object.assign({}, adminData), { profileImage: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                } }),
        });
        // Step 3: Now create the User with the new adminId
        const newUser = yield prisma_1.prisma.user.create({
            data: Object.assign(Object.assign({}, userData), { userId: newAdmin.adminId, adminId: newAdmin.adminId, emailVerificationToken: hashedToken, emailVerificationExpires: verificationExpires }),
        });
        console.log('Admin created', newAdmin);
        console.log('User created:', newUser);
        // Generate tokens using jwt helpers
        const accessToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
        const refreshToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
        // Set cookies
        auth_services_1.AuthServices.setAuthCookies(res, accessToken, refreshToken);
        // Send verification email
        yield auth_services_1.AuthServices.sendVerificationEmail(newUser.email, verificationToken);
        console.log('admin tokens...', { accessToken, refreshToken });
        return {
            accessToken,
            refreshToken,
            needsEmailVerification: true,
        };
    }
    catch (error) {
        console.error('Error during user creation:', error);
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create user profile');
    }
});
// Super Admin creation
const insertSuperAdminIntoDB = (superAdminData, userData, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userData.password) {
        userData.password = config_1.default.default.super_admin_pass;
    }
    // Hash the password before saving
    userData.password = yield (0, auth_utils_1.hashPassword)(userData.password);
    userData.role = client_1.UserRole.SUPER_ADMIN;
    userData.username = userData.username;
    userData.email = userData.email;
    try {
        // Generate verification token using existing utility pattern
        const { verificationToken, hashedToken } = (0, auth_utils_1.createEmailVerificationToken)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log('(2) verification token', verificationToken);
        console.log('(2.1) verification token expires', verificationExpires);
        // Step 1: Generate a unique super admin ID
        const superAdminId = yield (0, user_utils_1.generateSuperAdminId)();
        superAdminData.superAdminId = superAdminId;
        console.log('superAdminId: ', superAdminId);
        // Step 2: Create Super Admin first to ensure the superAdminId exists
        // Validate and upload profile image
        // Validate the new base64 image (throws error if invalid)
        if (superAdminData.profileImage) {
            const isValidImage = yield (0, user_utils_1.validateBase64Image)(superAdminData.profileImage);
            console.log('validate base image result:', isValidImage);
            if (!isValidImage) {
                throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Image file is too large. Maximum allowed size is 2 MB.');
            }
        }
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(superAdminData === null || superAdminData === void 0 ? void 0 : superAdminData.profileImage, {
            folder: 'jikmunn-project-management/avatars',
            width: 150,
            crop: 'scale',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ quality: 'auto' }], // Optimize image quality
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            chunk_size: 6000000, // 6MB chunks for large uploads
            timeout: 60000, // 60 seconds timeout
            invalidate: true, // Ensure old cached versions are replaced
        });
        const newSuperAdmin = yield prisma_1.prisma.superAdmin.create({
            data: Object.assign(Object.assign({}, superAdminData), { profileImage: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                } }),
        });
        // Step 3: Now create the User with the new superAdminId
        const newUser = yield prisma_1.prisma.user.create({
            data: Object.assign(Object.assign({}, userData), { userId: newSuperAdmin.superAdminId, superAdminId: newSuperAdmin.superAdminId, emailVerificationToken: hashedToken, emailVerificationExpires: verificationExpires }),
        });
        console.log('Super Admin created', newSuperAdmin);
        console.log('User created:', newUser);
        // Generate tokens using jwt helpers
        const accessToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
        const refreshToken = jwt_1.jwtHelpers.createToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
        // Set cookies
        auth_services_1.AuthServices.setAuthCookies(res, accessToken, refreshToken);
        // Send verification email
        yield auth_services_1.AuthServices.sendVerificationEmail(newUser.email, verificationToken);
        console.log('super admin tokens...', { accessToken, refreshToken });
        return {
            accessToken,
            refreshToken,
            needsEmailVerification: true,
        };
    }
    catch (error) {
        console.error('Error during user creation:', error);
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create user profile');
    }
});
exports.UserServices = {
    insertDeveloperIntoDB,
    insertManagerIntoDB,
    insertAdminIntoDB,
    insertSuperAdminIntoDB,
};
