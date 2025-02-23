"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    default: {
        developer_pass: process.env.DEFAULT_DEVELOPER_PASS,
        manager_pass: process.env.DEFAULT_MANAGER_PASS,
        admin_pass: process.env.DEFAULT_ADMIN_PASS,
        super_admin_pass: process.env.DEFAULT_SUPER_ADMIN_PASS,
    },
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt: {
        secret: process.env.JWT_SECRET,
        expires_in: process.env.JWT_EXPIRES_IN,
        refresh_secret: process.env.JWT_REFRESH_SECRET,
        refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    email: {
        smtp_host: process.env.SMTP_HOST,
        smtp_port: process.env.SMTP_PORT,
        smtp_username: process.env.SMTP_USERNAME,
        smtp_password: process.env.SMTP_PASSWORD,
        smtp_sender: process.env.SMTP_SENDER, // Using the same email as sender
    },
    frontend_url: process.env.FRONTEND_URL,
};
