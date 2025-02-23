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
exports.AdminServices = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const http_status_1 = __importDefault(require("http-status"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const pagination_1 = require("../../../helpers/pagination");
const prisma_1 = require("../../../shared/prisma");
const user_utils_1 = require("../user/user.utils");
const admin_constants_1 = require("./admin.constants");
// Get all admins
const getAllFromDB = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const { page, limit, skip } = pagination_1.paginationHelpers.calculatePagination(paginationOptions);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: admin_constants_1.adminSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length) {
        andConditions.push({
            AND: Object.entries(filterData).map(([field, value]) => ({
                [field]: {
                    equals: value,
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const admins = yield prisma_1.prisma.admin.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: paginationOptions.sortBy && paginationOptions.sortOrder
            ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
            : undefined,
    });
    const total = yield prisma_1.prisma.admin.count({ where: whereConditions });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: admins,
    };
});
// Get a single admin by ID
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.admin.findUnique({
        where: { adminId: id },
    });
    if (!result) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Sorry, the admin does not exist!');
    }
    return result;
});
// Update a admin by ID
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // First check if the admin exists
    const existingadmin = yield prisma_1.prisma.admin.findUnique({
        where: { adminId: id },
    });
    if (!existingadmin) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Admin not found!');
    }
    // If a new profile image is provided (and not an empty string)
    if (payload.profileImage && payload.profileImage !== '') {
        // If the existing admin has a profile image, destroy it on Cloudinary
        if (existingadmin.profileImage &&
            typeof existingadmin.profileImage === 'object') {
            const imageId = existingadmin.profileImage.public_id;
            if (imageId) {
                yield cloudinary_1.default.v2.uploader.destroy(imageId);
            }
        }
        // Validate the new base64 image (throws error if invalid)
        const isValidImage = yield (0, user_utils_1.validateBase64Image)(payload.profileImage);
        console.log('validate base image result:', isValidImage);
        if (!isValidImage) {
            throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Image file is too large. Maximum allowed size is 2 MB.');
        }
        // Upload the new image
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(payload.profileImage, {
            folder: 'jikmunn-project-management/avatars',
            width: 150,
            crop: 'scale',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ quality: 'auto' }],
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            chunk_size: 6000000, // 6MB chunks for large uploads
            timeout: 60000, // 60 seconds timeout
            invalidate: true, // Ensure old cached versions are replaced
        });
        // Update the admin record with the new profile image details
        const result = yield prisma_1.prisma.admin.update({
            where: { adminId: id },
            data: Object.assign(Object.assign({}, payload), { profileImage: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                } }),
        });
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.CONFLICT, 'Sorry, failed to update!');
        }
        return result;
    }
    // If no new image is provided, update without changing the profile image
    const result = yield prisma_1.prisma.admin.update({
        where: { adminId: id },
        data: payload,
    });
    if (!result) {
        throw new handleApiError_1.default(http_status_1.default.CONFLICT, 'Sorry, failed to update!');
    }
    return result;
});
// Delete a admin by ID
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Find the admin by adminId, including the related user
        const admin = yield tx.admin.findUnique({
            where: { adminId: id },
            include: { user: true },
        });
        if (!admin) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'Sorry, the admin does not exist!');
        }
        // If a profile image exists and is an object, attempt to destroy the image on Cloudinary
        if (admin.profileImage && typeof admin.profileImage === 'object') {
            const imageId = admin.profileImage.public_id;
            if (imageId) {
                yield cloudinary_1.default.v2.uploader.destroy(imageId);
            }
        }
        // If there is an associated user, delete it as well
        if (admin.user) {
            yield tx.user.delete({
                where: { userId: admin.user.userId },
            });
        }
        // Delete the admin record
        const result = yield tx.admin.delete({
            where: { adminId: id },
        });
        if (!result) {
            throw new handleApiError_1.default(http_status_1.default.CONFLICT, 'Sorry, failed to delete!');
        }
        return result;
    }));
});
exports.AdminServices = {
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
