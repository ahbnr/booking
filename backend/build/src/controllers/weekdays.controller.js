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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekdaysController = void 0;
const weekday_model_1 = require("../models/weekday.model");
const errors_1 = require("./errors");
const autobind_decorator_1 = require("autobind-decorator");
const timeslot_model_1 = require("../models/timeslot.model");
const timeslots_controller_1 = require("./timeslots.controller");
const dist_1 = require("common/dist");
let WeekdaysController = class WeekdaysController {
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekdays = yield weekday_model_1.Weekday.findAll({});
            res.json(weekdays.map((booking) => booking.toTypedJSON()));
        });
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekday = yield this.getWeekday(req);
            res.json(weekday.toTypedJSON());
        });
    }
    createTimeslot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekday = yield this.getWeekday(req);
            const timeslotData = dist_1.checkType(req.body, dist_1.TimeslotPostInterface);
            try {
                const timeslot = yield timeslot_model_1.Timeslot.create(Object.assign({ weekdayId: weekday.id }, timeslotData));
                res
                    .status(201)
                    .json(yield timeslots_controller_1.TimeslotsController.timeslotAsGetInterface(timeslot));
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
    }
    getTimeslots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekday = yield this.getWeekday(req);
            const timeslots = weekday === null || weekday === void 0 ? void 0 : weekday.timeslots;
            if (timeslots != null) {
                res.json(yield Promise.all(timeslots.map((timeslot) => timeslots_controller_1.TimeslotsController.timeslotAsGetInterface(timeslot))));
            }
            else {
                res.json([]);
            }
        });
    }
    // noinspection JSMethodCanBeStatic
    getWeekday(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekday = yield weekday_model_1.Weekday.findByPk(req.params.id, {
                include: [timeslot_model_1.Timeslot],
            });
            if (weekday != null) {
                return weekday;
            }
            else {
                throw new errors_1.ControllerError('Weekday not found', 404);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekdayData = dist_1.checkType(req.body, dist_1.WeekdayPostInterface);
            const update = {
                where: { id: req.params.id },
                limit: 1,
            };
            try {
                yield weekday_model_1.Weekday.update(weekdayData, update);
                res.status(202).json({ data: 'success' });
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekdayName = req.params.name;
            if (weekdayName != null) {
                const options = {
                    where: { name: weekdayName },
                    limit: 1,
                };
                try {
                    yield weekday_model_1.Weekday.destroy(options);
                    res.status(204).json({ data: 'success' });
                }
                catch (error) {
                    res.status(500).json(error);
                }
            }
            else {
                res.status(500).json({ data: 'Weekday not specified.' });
            }
        });
    }
};
WeekdaysController = __decorate([
    autobind_decorator_1.boundClass
], WeekdaysController);
exports.WeekdaysController = WeekdaysController;
