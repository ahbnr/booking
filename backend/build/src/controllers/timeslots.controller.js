"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var TimeslotsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeslotsController = void 0;
const timeslot_model_1 = require("../models/timeslot.model");
const errors_1 = require("./errors");
const autobind_decorator_1 = require("autobind-decorator");
const booking_model_1 = require("../models/booking.model");
const bookings_controller_1 = require("./bookings.controller");
const weekday_model_1 = require("../models/weekday.model");
const dist_1 = require("common/dist");
let TimeslotsController = TimeslotsController_1 = class TimeslotsController {
    static timeslotAsGetInterface(timeslot) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _a = timeslot.toTypedJSON(), { bookings, weekday } = _a, strippedTimeslot = __rest(_a, ["bookings", "weekday"]);
            const lazyBookings = yield timeslot.lazyBookings;
            const lazyWeekday = yield timeslot.lazyWeekday;
            // no refinement checks, we assume the database records are correct at least regarding refinements
            return dist_1.noRefinementChecks(Object.assign(Object.assign({}, strippedTimeslot), { bookingIds: lazyBookings.map((booking) => booking.id), weekdayName: lazyWeekday.name }));
        });
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslots = yield timeslot_model_1.Timeslot.findAll({});
            res.json(yield Promise.all(timeslots.map(TimeslotsController_1.timeslotAsGetInterface)));
        });
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslot = yield TimeslotsController_1.getTimeslot(req);
            res.json(yield TimeslotsController_1.timeslotAsGetInterface(timeslot));
        });
    }
    getBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslot = yield TimeslotsController_1.getTimeslot(req);
            const bookings = yield bookings_controller_1.BookingsController.clearPastBookings((timeslot === null || timeslot === void 0 ? void 0 : timeslot.bookings) || []);
            res.json(dist_1.noRefinementChecks(bookings));
        });
    }
    // noinspection JSMethodCanBeStatic
    static getTimeslot(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslot = yield timeslot_model_1.Timeslot.findByPk(req.params.id, {
                include: [booking_model_1.Booking, weekday_model_1.Weekday],
            });
            if (timeslot != null) {
                return timeslot;
            }
            else {
                throw new errors_1.ControllerError('Timeslot not found', 404);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslotData = dist_1.checkType(req.body, dist_1.TimeslotPostInterface);
            const update = {
                where: { id: req.params.id },
                limit: 1,
            };
            try {
                yield timeslot_model_1.Timeslot.update(timeslotData, update);
                res.status(202).json({ data: 'success' });
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                where: { id: req.params.id },
                limit: 1,
            };
            try {
                yield timeslot_model_1.Timeslot.destroy(options);
                res.status(204).json({ data: 'success' });
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
    }
};
TimeslotsController = TimeslotsController_1 = __decorate([
    autobind_decorator_1.boundClass
], TimeslotsController);
exports.TimeslotsController = TimeslotsController;
