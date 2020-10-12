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
Array.prototype.partition = function (predicate) {
    return (this
        // based on https://codereview.stackexchange.com/a/162879
        .reduce((result, element) => {
        result[predicate(element) ? 0 : 1].push(element);
        return result;
    }, [[], []]));
};
Array.prototype.asyncPartition = function (predicate) {
    return __awaiter(this, void 0, void 0, function* () {
        const self = this;
        const promiseMap = self.map((element) => (() => __awaiter(this, void 0, void 0, function* () {
            return [element, yield predicate(element)];
        }))());
        return ((yield Promise.all(promiseMap))
            // based on https://codereview.stackexchange.com/a/162879
            .reduce((result, elementPair) => {
            const [element, predResult] = elementPair;
            result[predResult ? 0 : 1].push(element);
            return result;
        }, [[], []]));
    });
};
