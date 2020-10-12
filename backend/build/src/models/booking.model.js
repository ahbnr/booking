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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const timeslot_model_1 = require("./timeslot.model");
const moment_1 = __importDefault(require("moment"));
const sequelize_typescript_2 = require("sequelize-typescript");
const luxon_1 = require("luxon");
const LazyGetter_1 = require("../utils/LazyGetter");
const BaseModel_1 = require("./BaseModel");
let Booking = class Booking extends BaseModel_1.BaseModel {
    timeTillDue() {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslot = yield this.lazyTimeslot;
            if (timeslot != null) {
                const currentDate = luxon_1.DateTime.local();
                const nextEndDate = yield timeslot.getNextTimeslotEndDate();
                const interval = luxon_1.Interval.fromDateTimes(currentDate, nextEndDate);
                return interval.toDuration();
            }
            else {
                throw new Error('Could not retrieve timeslot.');
            }
        });
    }
    hasPassed() {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslot = yield this.lazyTimeslot;
            if (timeslot != null) {
                return (moment_1.default(this.createdAt) <= (yield timeslot.getPreviousTimeslotEndDate()));
            }
            else {
                throw new Error('Can not retrieve timeslot. Did you ask Sequelize to include the Timeslot relationship when retrieving this Booking instance?');
            }
        });
    }
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
], Booking.prototype, "id", void 0);
__decorate([
    sequelize_typescript_2.ForeignKey(() => timeslot_model_1.Timeslot),
    sequelize_typescript_2.Column({ allowNull: false }),
    __metadata("design:type", Number)
], Booking.prototype, "timeslotId", void 0);
__decorate([
    sequelize_typescript_1.NotEmpty,
    sequelize_typescript_2.Column({ allowNull: false }),
    __metadata("design:type", String)
], Booking.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.IsEmail,
    sequelize_typescript_2.Column({ allowNull: false }),
    __metadata("design:type", String)
], Booking.prototype, "email", void 0);
__decorate([
    sequelize_typescript_2.BelongsTo(() => timeslot_model_1.Timeslot),
    __metadata("design:type", timeslot_model_1.Timeslot)
], Booking.prototype, "timeslot", void 0);
__decorate([
    LazyGetter_1.LazyGetter((o) => o.timeslot, { shouldBePresent: true }),
    __metadata("design:type", Promise)
], Booking.prototype, "lazyTimeslot", void 0);
__decorate([
    sequelize_typescript_2.CreatedAt,
    __metadata("design:type", Date)
], Booking.prototype, "createdAt", void 0);
Booking = __decorate([
    sequelize_typescript_2.Table
], Booking);
exports.Booking = Booking;
