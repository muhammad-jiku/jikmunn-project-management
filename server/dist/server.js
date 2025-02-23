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
const cloudinary_1 = require("cloudinary");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
// import { logger, errorlogger } from './shared/logger';
process.on('uncaughtException', (error) => {
    // errorlogger.error(error);
    console.error(error);
    process.exit(1);
});
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        // Cloudinary Config
        cloudinary_1.v2.config({
            cloud_name: config_1.default.cloudinary.cloud_name,
            api_key: config_1.default.cloudinary.api_key,
            api_secret: config_1.default.cloudinary.api_secret,
        });
        const server = app_1.default.listen(config_1.default.port, () => {
            // logger.info(`Server running on http://localhost:${config.port}`);
            console.log(`Server running on http://localhost:${config_1.default.port}`);
        });
        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    // logger.info('Server closed');
                    console.log('Server closed');
                });
            }
            process.exit(1);
        };
        const unexpectedErrorHandler = (error) => {
            // errorlogger.error(error);
            console.error(error);
            exitHandler();
        };
        process.on('uncaughtException', unexpectedErrorHandler);
        process.on('unhandledRejection', unexpectedErrorHandler);
        process.on('SIGTERM', () => {
            // logger.info('SIGTERM received');
            console.log('SIGTERM received');
            if (server) {
                server.close();
            }
        });
    });
}
bootstrap();
