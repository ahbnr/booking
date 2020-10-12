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
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendMail(receiverMail, subject, textContent, htmlContent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (htmlContent == null) {
            htmlContent = textContent;
        }
        // FIXME: Replace with real SMTP server and account
        const testAccount = yield nodemailer_1.default.createTestAccount();
        // FIXME: this object is reusable, we should cache it somewhere
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        // send mail
        const info = yield transporter.sendMail({
            from: '"booking@example.com" <booking@example.com>',
            to: receiverMail,
            subject: subject,
            html: htmlContent,
            text: textContent,
        });
        // Mail preview:
        console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
    });
}
exports.sendMail = sendMail;
