"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_1 = __importDefault(require("http-status"));
const morgan_1 = __importDefault(require("morgan"));
const dbConnectionMiddleware_1 = require("./app/middlewares/dbConnectionMiddleware");
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./app/routes"));
const app = (0, express_1.default)();
// TRUST PROXY – must come before any rate-limit or CORS
//    On Vercel you generally trust the first proxy hop:
app.set('trust proxy', 1);
// cors options
// This is a simple CORS configuration.
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL]
        : 'http://localhost:3000',
    credentials: true, // Important for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
// const corsOptions = {
//   origin: (origin: any, callback: any) => {
//     const allowedOrigins =
//       process.env.NODE_ENV === 'production'
//         ? [process.env.FRONTEND_URL]
//         : ['http://localhost:3000'];
//     // Allow requests with no origin (like mobile apps, curl requests, etc)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log(`Blocked CORS request from: ${origin}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
app.use((0, cors_1.default)(corsOptions));
// cookie parsers and security
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use((0, morgan_1.default)('common'));
// body parsers
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ limit: '20mb', extended: true }));
app.use(body_parser_1.default.json({ limit: '20mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '20mb', extended: true }));
// api route initialization
app.use('/api/v1', dbConnectionMiddleware_1.ensureDatabaseConnection, routes_1.default);
// global error handler
app.use(globalErrorHandler_1.default);
// handle not found
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: 'Not Found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'API Not Found',
            },
        ],
    });
    next();
});
exports.default = app;
