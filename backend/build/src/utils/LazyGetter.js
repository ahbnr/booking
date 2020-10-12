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
exports.LazyGetter = void 0;
const index_1 = require("ts-simple-nameof/index");
function LazyGetter(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
propertyResolver, options = {}) {
    const shouldBePresent = (options === null || options === void 0 ? void 0 : options.shouldBePresent) || false;
    const convertNullToEmptyArray = (options === null || options === void 0 ? void 0 : options.convertNullToEmptyArray) || false;
    if (shouldBePresent && convertNullToEmptyArray) {
        throw new Error('The options "shouldBePresent" and "convertNullToEmptyArray" are mutually exclusive.');
    }
    const targetPropertyName = index_1.nameof(propertyResolver);
    return function (targetPrototype, propertyKey) {
        let value = null;
        const getter = function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (value != null) {
                    return value;
                }
                else {
                    value = yield this.$get(targetPropertyName);
                    if (value == null) {
                        if (convertNullToEmptyArray) {
                            value = [];
                        }
                        else if (shouldBePresent) {
                            throw new Error(`The field ${targetPropertyName} should always be present but it is not right now. This should never happen and means there is an INCONSISTENCY IN THE DATABASE.`);
                        }
                    }
                    return value;
                }
            });
        };
        Object.defineProperty(targetPrototype, propertyKey, {
            get: getter,
            set: setReject,
        });
    };
}
exports.LazyGetter = LazyGetter;
function setReject(_) {
    throw new Error('Read-only property. Can not set value.');
}
