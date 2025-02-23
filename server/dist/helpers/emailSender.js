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
exports.EmailHelper = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.email.smtp_host,
    port: Number(config_1.default.email.smtp_port),
    secure: false,
    auth: {
        user: config_1.default.email.smtp_username,
        pass: config_1.default.email.smtp_password,
    },
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const emailOptions = {
        from: config_1.default.email.smtp_sender,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };
    yield transporter.sendMail(emailOptions);
});
exports.EmailHelper = {
    sendEmail,
};
