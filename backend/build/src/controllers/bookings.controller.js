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
var BookingsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const booking_model_1 = require("../models/booking.model");
require("../utils/array_extensions");
const autobind_decorator_1 = require("autobind-decorator");
const timeslot_model_1 = require("../models/timeslot.model");
const email_1 = require("../utils/email");
const passport_1 = require("../config/passport");
const timeslots_controller_1 = require("./timeslots.controller");
const jwt_1 = require("../utils/jwt");
const common_1 = require("common");
const dist_1 = require("common/dist");
const BookingLookupTokenData_1 = require("../types/token-types/BookingLookupTokenData");
let BookingsController = BookingsController_1 = class BookingsController {
    static clearPastBookings(bookings) {
        return __awaiter(this, void 0, void 0, function* () {
            const [old_bookings, valid_bookings,] = yield bookings.asyncPartition((booking) => booking.hasPassed());
            for (const booking of old_bookings) {
                yield booking.destroy();
            }
            return valid_bookings;
        });
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const lookupToken = req.query.token;
            if (lookupToken != null && typeof lookupToken === 'string') {
                const result = dist_1.noRefinementChecks(yield BookingsController_1.listBookingsByLookupToken(lookupToken));
                res.json(result);
            }
            else if (req.authenticated) {
                const bookings = yield booking_model_1.Booking.findAll({
                    include: [timeslot_model_1.Timeslot],
                });
                res.json(dist_1.noRefinementChecks((yield BookingsController_1.clearPastBookings(bookings)).map((booking) => booking.toTypedJSON())));
            }
            else {
                res.status(401).json();
            }
        });
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let booking = yield booking_model_1.Booking.findByPk(req.params.id, {
                    include: [timeslot_model_1.Timeslot],
                });
                if (booking != null && (yield booking.hasPassed())) {
                    yield booking.destroy();
                    booking = null;
                }
                if (booking != null) {
                    res.json(dist_1.noRefinementChecks(booking.toTypedJSON()));
                }
                else {
                    res.status(404).json();
                }
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
    }
    createBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeslot = yield timeslots_controller_1.TimeslotsController.getTimeslot(req);
            const bookingPostData = common_1.checkType(req.body, common_1.BookingPostInterface);
            const booking = yield booking_model_1.Booking.create(Object.assign({ timeslotId: timeslot.id }, bookingPostData));
            yield BookingsController_1.sendBookingLookupMail(bookingPostData.lookupUrl, booking);
            res
                .status(201)
                .json(dist_1.noRefinementChecks(booking.toTypedJSON()));
        });
    }
    static createBookingLookupToken(booking) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = common_1.checkType(booking.email, common_1.EMailString);
            const validDuration = yield booking.timeTillDue();
            const secondsUntilExpiration = Math.floor(validDuration.shiftTo('seconds').seconds);
            const data = {
                type: 'BookingLookupToken',
                email: email,
            };
            return yield jwt_1.asyncJwtSign(data, passport_1.jwtSecret, {
                expiresIn: secondsUntilExpiration,
            });
        });
    }
    static sendBookingLookupMail(lookupUrl, booking) {
        return __awaiter(this, void 0, void 0, function* () {
            const lookupToken = yield BookingsController_1.createBookingLookupToken(booking);
            yield email_1.sendMail(booking.email, 'Ihre Buchung', '', // TODO text representation
            `<a href="${lookupUrl}?lookupToken=${lookupToken}">Einsehen</a>`);
        });
    }
    static listBookingsByLookupToken(lookupToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const verifiedToken = yield jwt_1.asyncJwtVerify(lookupToken, passport_1.jwtSecret);
            const tokenData = common_1.checkType(verifiedToken, BookingLookupTokenData_1.BookingLookupTokenData);
            return booking_model_1.Booking.findAll({
                where: { email: tokenData.email },
            });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingPostData = common_1.checkType(req.body, common_1.BookingPostInterface);
            const update = {
                where: { id: req.params.id },
                limit: 1,
            };
            try {
                // noinspection JSUnusedLocalSymbols
                const [_, [booking]] = yield booking_model_1.Booking.update(bookingPostData, update); // eslint-disable-line @typescript-eslint/no-unused-vars
                yield BookingsController_1.sendBookingLookupMail(bookingPostData.lookupUrl, booking);
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
                yield booking_model_1.Booking.destroy(options);
                res.status(204).json({ data: 'success' });
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
    }
};
BookingsController = BookingsController_1 = __decorate([
    autobind_decorator_1.boundClass
], BookingsController);
exports.BookingsController = BookingsController;
