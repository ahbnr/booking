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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_typescript_2 = require("sequelize-typescript");
const weekday_model_1 = require("./weekday.model");
const BaseModel_1 = require("./BaseModel");
let Resource = class Resource extends BaseModel_1.BaseModel {
};
__decorate([
    sequelize_typescript_2.PrimaryKey,
    sequelize_typescript_1.NotEmpty,
    sequelize_typescript_2.Column,
    __metadata("design:type", String)
], Resource.prototype, "name", void 0);
__decorate([
    sequelize_typescript_2.HasMany(() => weekday_model_1.Weekday, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Resource.prototype, "weekdays", void 0);
Resource = __decorate([
    sequelize_typescript_2.Table
], Resource);
exports.Resource = Resource;
