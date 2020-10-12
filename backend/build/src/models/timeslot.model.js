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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeslot = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const weekday_model_1 = require("./weekday.model");
const date_1 = require("../utils/date");
const booking_model_1 = require("./booking.model");
const luxon_1 = require("luxon");
const LazyGetter_1 = require("../utils/LazyGetter");
const BaseModel_1 = require("./BaseModel");
let Timeslot = class Timeslot extends BaseModel_1.BaseModel {
    getPreviousTimeslotEndDate() {
        return __awaiter(this, void 0, void 0, function* () {
            const weekday = yield this.lazyWeekday;
            const previousDate = date_1.getPreviousWeekdayDate(weekday.name);
            return previousDate
                .add(this.endHours, 'hours')
                .add(this.endMinutes, 'minutes');
        });
    }
    getNextTimeslotEndDate() {
        return __awaiter(this, void 0, void 0, function* () {
            const weekday = yield this.lazyWeekday;
            let nextWeekdayData = date_1.getNextWeekdayDate(weekday.name);
            // is it today?
            if (nextWeekdayData.weekday === date_1.weekdayToInt(weekday.name)) {
                const now = luxon_1.DateTime.local();
                if (now.hour >= this.endHours ||
                    (now.hour === this.endHours && now.minute >= this.endMinutes)) {
                    nextWeekdayData = nextWeekdayData.plus(luxon_1.Duration.fromObject({ weeks: 1 }));
                }
            }
            return nextWeekdayData.plus(luxon_1.Duration.fromObject({
                hours: this.endHours,
                minutes: this.endMinutes,
            }));
        });
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.INTEGER,
        onDelete: 'CASCADE',
        autoIncrement: true,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Timeslot.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => weekday_model_1.Weekday),
    sequelize_typescript_1.Column({ allowNull: false }),
    __metadata("design:type", Number)
], Timeslot.prototype, "weekdayId", void 0);
__decorate([
    sequelize_typescript_1.Column({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Timeslot.prototype, "startHours", void 0);
__decorate([
    sequelize_typescript_1.Column({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Timeslot.prototype, "startMinutes", void 0);
__decorate([
    sequelize_typescript_1.Column({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Timeslot.prototype, "endHours", void 0);
__decorate([
    sequelize_typescript_1.Column({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Timeslot.prototype, "endMinutes", void 0);
__decorate([
    sequelize_typescript_1.Column({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Timeslot.prototype, "capacity", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => booking_model_1.Booking, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Timeslot.prototype, "bookings", void 0);
__decorate([
    LazyGetter_1.LazyGetter((o) => o.bookings, { convertNullToEmptyArray: true }),
    __metadata("design:type", Promise)
], Timeslot.prototype, "lazyBookings", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => weekday_model_1.Weekday),
    __metadata("design:type", weekday_model_1.Weekday)
], Timeslot.prototype, "weekday", void 0);
__decorate([
    LazyGetter_1.LazyGetter((o) => o.weekday, { shouldBePresent: true }),
    __metadata("design:type", Promise)
], Timeslot.prototype, "lazyWeekday", void 0);
Timeslot = __decorate([
    sequelize_typescript_1.Table
], Timeslot);
exports.Timeslot = Timeslot;
