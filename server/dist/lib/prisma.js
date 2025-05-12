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
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prismaClientOptions = {
    datasources: {
        db: {
            url: process.env.POSTGRES_PRISMA_URL,
        },
    },
    transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted,
    },
    errorFormat: 'minimal',
    log: process.env.NODE_ENV === 'development'
        ? [
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
            { level: 'query', emit: 'event' },
        ]
        : [],
};
exports.prisma = global.prisma || new client_1.PrismaClient(prismaClientOptions);
if (process.env.NODE_ENV === 'development') {
    global.prisma = exports.prisma;
    // Add query logging
    exports.prisma.$on('query', (e) => {
        if (e.duration > 500) {
            console.log(`[SLOW QUERY] ${e.query} (${e.duration}ms)`); // debugging log
        }
    });
    const cleanup = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('[DB] Cleaning up Prisma connection...'); // debugging log
        yield exports.prisma.$disconnect();
    });
    process.on('beforeExit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}
