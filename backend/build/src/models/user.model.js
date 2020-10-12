"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_typescript_2 = require("sequelize-typescript");
const bcrypt_1 = __importDefault(require("bcrypt"));
const BaseModel_1 = require("./BaseModel");
let User = User_1 = class User extends BaseModel_1.BaseModel {
    static onCreateHashPassword(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            instance.password = yield User_1.hashPassword(instance.password);
        });
    }
    static onBulkCreateHashPassword(instances, _) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(instances.map(User_1.onCreateHashPassword));
        });
    }
    static onUpdateHashPassword(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield User_1.onCreateHashPassword(instance);
        });
    }
    static onBulkUpdateHashPassword(instances, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield User_1.onBulkCreateHashPassword(instances, options);
        });
    }
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Ensure this hashing method is save enough
            return yield bcrypt_1.default.hash(password, yield bcrypt_1.default.genSalt(10));
        });
    }
    doesPasswordMatch(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(password, this.password);
        });
    }
};
__decorate([
    sequelize_typescript_2.PrimaryKey,
    sequelize_typescript_1.NotEmpty,
    sequelize_typescript_2.Column,
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.IsEmail,
    sequelize_typescript_2.Column({ allowNull: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.NotEmpty,
    sequelize_typescript_2.Column({ allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "onCreateHashPassword", null);
__decorate([
    sequelize_typescript_1.BeforeBulkCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], User, "onBulkCreateHashPassword", null);
__decorate([
    sequelize_typescript_1.BeforeUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "onUpdateHashPassword", null);
__decorate([
    sequelize_typescript_1.BeforeBulkUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], User, "onBulkUpdateHashPassword", null);
User = User_1 = __decorate([
    sequelize_typescript_2.Table
], User);
exports.User = User;
