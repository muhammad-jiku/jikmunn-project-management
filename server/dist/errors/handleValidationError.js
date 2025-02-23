"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleValidationError = (err) => {
    const errors = [
        {
            path: '',
            message: err.message,
        },
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation error!',
        errorMessages: errors,
    };
};
exports.default = handleValidationError;
