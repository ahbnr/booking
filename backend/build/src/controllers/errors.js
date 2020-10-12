"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerError = void 0;
class ControllerError {
    constructor(message, errorCode) {
        this.message = message;
        this.errorCode = errorCode;
    }
}
exports.ControllerError = ControllerError;
