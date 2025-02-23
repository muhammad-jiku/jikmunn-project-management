"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pick = void 0;
// ['page', 'limit', 'sortBy', 'sortOrder']
const pick = (obj, keys) => {
    const finalObj = {};
    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            finalObj[key] = obj[key];
        }
    }
    return finalObj;
};
exports.pick = pick;
