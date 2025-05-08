"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient({
    transactionOptions: {
        maxWait: 20000, // wait up to 20 seconds for a transaction
        timeout: 30000, // allow the transaction to run up to 30 seconds
        isolationLevel: 'ReadCommitted',
    },
    errorFormat: 'minimal',
});
