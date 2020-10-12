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
exports.Weekday = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const timeslot_model_1 = require("./timeslot.model");
const sequelize_typescript_2 = require("sequelize-typescript");
const resource_model_1 = require("./resource.model");
const dist_1 = require("common/dist");
const BaseModel_1 = require("./BaseModel");
let Weekday = class Weekday extends BaseModel_1.BaseModel {
};
__decorate([
    sequelize_typescript_2.PrimaryKey,
    sequelize_typescript_2.Column({
        type: sequelize_typescript_1.DataType.INTEGER,
        onDelete: 'CASCADE',
        autoIncrement: true,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Weekday.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.IsIn([dist_1.WeekdayNameValues]),
    sequelize_typescript_2.Column({
        type: sequelize_typescript_1.DataType.STRING(10),
        onDelete: 'CASCADE',
        allowNull: false,
    }),
    __metadata("design:type", String)
], Weekday.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => resource_model_1.Resource),
    sequelize_typescript_2.Column({ allowNull: false }),
    __metadata("design:type", String)
], Weekday.prototype, "resourceName", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => resource_model_1.Resource),
    __metadata("design:type", resource_model_1.Resource)
], Weekday.prototype, "resource", void 0);
__decorate([
    sequelize_typescript_2.HasMany(() => timeslot_model_1.Timeslot, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Weekday.prototype, "timeslots", void 0);
Weekday = __decorate([
    sequelize_typescript_2.Table
], Weekday);
exports.Weekday = Weekday;
