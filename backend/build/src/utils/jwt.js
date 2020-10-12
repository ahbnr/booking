"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncJwtSign = exports.asyncJwtVerify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function asyncJwtVerify(token, secretOrPublicKey, options
// eslint-disable-next-line @typescript-eslint/ban-types
) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return new Promise((resolve, reject) => 
    // eslint-disable-next-line @typescript-eslint/ban-types
    jsonwebtoken_1.default.verify(token, secretOrPublicKey, options, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    (err, decoded) => {
        if (err != null) {
            reject(err);
        }
        else if (decoded != null) {
            resolve(decoded);
        }
        else {
            reject('Token could not be verified.');
        }
    }));
}
exports.asyncJwtVerify = asyncJwtVerify;
function asyncJwtSign(
// eslint-disable-next-line @typescript-eslint/ban-types
payload, secretOrPrivateKey, options) {
    return new Promise((resolve, reject) => jsonwebtoken_1.default.sign(payload, secretOrPrivateKey, options, (err, token) => {
        if (err != null) {
            reject(err);
        }
        else if (token != null) {
            resolve(token);
        }
        else {
            reject('Could not sign token');
        }
    }));
}
exports.asyncJwtSign = asyncJwtSign;
