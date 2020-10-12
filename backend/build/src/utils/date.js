"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextWeekdayDate = exports.getPreviousWeekdayDate = exports.weekdayToInt = void 0;
const moment_1 = __importDefault(require("moment"));
const luxon_1 = require("luxon");
function weekdayToInt(weekday) {
    switch (weekday) {
        case 'monday':
            return 1;
        case 'tuesday':
            return 2;
        case 'wednesday':
            return 3;
        case 'thursday':
            return 4;
        case 'friday':
            return 5;
        case 'saturday':
            return 6;
        case 'sunday':
            return 7;
    }
}
exports.weekdayToInt = weekdayToInt;
// FIXME: Replace moment with luxon
function getPreviousWeekdayDate(weekday) {
    const targetWeekdayInt = weekdayToInt(weekday);
    const today = moment_1.default().isoWeekday();
    let result;
    // We did not yet pass the target weekday in the current week...
    if (today <= targetWeekdayInt) {
        // hence, we need to get the target day from the previous week
        result = moment_1.default().subtract(1, 'weeks').isoWeekday(targetWeekdayInt);
    }
    else {
        // otherwise we can just use the target day from the current week
        result = moment_1.default().isoWeekday(targetWeekdayInt);
    }
    return result.startOf('day');
}
exports.getPreviousWeekdayDate = getPreviousWeekdayDate;
function getNextWeekdayDate(weekday) {
    const targetWeekdayInt = weekdayToInt(weekday);
    const today = luxon_1.DateTime.local().weekday;
    let result;
    // We did not yet pass the target weekday in the current week...
    if (today <= targetWeekdayInt) {
        // hence, we can just use the target day from the current week
        result = luxon_1.DateTime.local().set({ weekday: targetWeekdayInt });
    }
    else {
        // otherwise we need to get the target day from the next week
        result = luxon_1.DateTime.local()
            .plus(luxon_1.Duration.fromObject({ weeks: 1 }))
            .set({ weekday: targetWeekdayInt });
    }
    return result.startOf('day');
}
exports.getNextWeekdayDate = getNextWeekdayDate;
