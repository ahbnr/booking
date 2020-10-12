"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const weekdays_controller_1 = require("../controllers/weekdays.controller");
const timeslots_controller_1 = require("../controllers/timeslots.controller");
const bookings_controller_1 = require("../controllers/bookings.controller");
const users_controller_1 = require("../controllers/users.controller");
const passport_1 = require("./passport");
const resources_controller_1 = require("../controllers/resources.controller");
class Routes {
    constructor() {
        this.usersController = new users_controller_1.UsersController();
        this.resourcesController = new resources_controller_1.ResourcesController();
        this.weekdaysController = new weekdays_controller_1.WeekdaysController();
        this.timeslotsController = new timeslots_controller_1.TimeslotsController();
        this.bookingsController = new bookings_controller_1.BookingsController();
    }
    static asyncHandler(handler) {
        return (req, res, next) => {
            handler(req, res, next).catch(next);
        };
    }
    routes(app) {
        app.route('/').get((req, res) => res.json('Hello'));
        app
            .route('/users/auth')
            .post(Routes.asyncHandler(this.usersController.auth));
        app
            .route('/users/inviteForSignup')
            .post(Routes.asyncHandler(this.usersController.inviteForSignup));
        app
            .route('/users/isSignupTokenOk')
            .post(Routes.asyncHandler(this.usersController.isSignupTokenOk));
        app
            .route('/users/signup')
            .post(Routes.asyncHandler(this.usersController.signup));
        app
            .route('/resources')
            .get(Routes.asyncHandler(this.resourcesController.index));
        app
            .route('/resources/:name')
            .get(Routes.asyncHandler(this.resourcesController.show))
            .post(passport_1.authHandler, Routes.asyncHandler(this.resourcesController.create))
            .put(passport_1.authHandler, Routes.asyncHandler(this.resourcesController.update))
            .delete(passport_1.authHandler, Routes.asyncHandler(this.resourcesController.delete));
        app
            .route('/resources/:name/weekdays')
            .get(Routes.asyncHandler(this.resourcesController.getWeekdays))
            .post(passport_1.authHandler, Routes.asyncHandler(this.resourcesController.createWeekday));
        app
            .route('/weekdays')
            .get(Routes.asyncHandler(this.weekdaysController.index));
        app
            .route('/weekdays/:id')
            .get(Routes.asyncHandler(this.weekdaysController.show))
            .put(passport_1.authHandler, Routes.asyncHandler(this.weekdaysController.update))
            .delete(passport_1.authHandler, Routes.asyncHandler(this.weekdaysController.delete));
        app
            .route('/weekdays/:id/timeslots')
            .get(Routes.asyncHandler(this.weekdaysController.getTimeslots))
            .post(passport_1.authHandler, Routes.asyncHandler(this.weekdaysController.createTimeslot));
        app
            .route('/timeslots')
            .get(Routes.asyncHandler(this.timeslotsController.index));
        app
            .route('/timeslots/:id')
            .get(Routes.asyncHandler(this.timeslotsController.show))
            .put(passport_1.authHandler, Routes.asyncHandler(this.timeslotsController.update))
            .delete(passport_1.authHandler, Routes.asyncHandler(this.timeslotsController.delete));
        app
            .route('/timeslots/:id/bookings')
            .get(passport_1.authHandler, Routes.asyncHandler(this.timeslotsController.getBookings))
            .post(Routes.asyncHandler(this.bookingsController.createBooking));
        app
            .route('/bookings')
            .get(passport_1.optionalAuthHandler, Routes.asyncHandler(this.bookingsController.index));
        app
            .route('/bookings/:id')
            .get(passport_1.authHandler, Routes.asyncHandler(this.bookingsController.show))
            .put(passport_1.authHandler, Routes.asyncHandler(this.bookingsController.update))
            .delete(passport_1.authHandler, Routes.asyncHandler(this.bookingsController.delete));
    }
}
exports.Routes = Routes;
