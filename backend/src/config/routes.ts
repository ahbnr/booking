import {Application, NextFunction, RequestHandler, Request, Response} from "express";
import {WeekdaysController} from "../controllers/weekdays.controller";
import {TimeslotsController} from "../controllers/timeslots.controller";
import {BookingsController} from "../controllers/bookings.controller";

export class Routes {
    private weekdaysController: WeekdaysController = new WeekdaysController();
    private timeslotsController: TimeslotsController = new TimeslotsController();
    private bookingsController: BookingsController = new BookingsController();

    private static asyncHandler<T>(handler: (req: Request, res: Response) => Promise<T>): RequestHandler {
        return (req: Request, res: Response, next: NextFunction) => {
            handler(req, res)
                .catch(next)
        }
    }

    public routes(app: Application): void {
        app.route("/").get(
            (req, res) => res.json("Hello")
        );

        app
            .route("/weekdays")
            .get(Routes.asyncHandler(this.weekdaysController.index))
        app
            .route("/weekdays/:name")
            .post(Routes.asyncHandler(this.weekdaysController.create))
            .get(Routes.asyncHandler(this.weekdaysController.show))
            .put(Routes.asyncHandler(this.weekdaysController.update))
            .delete(Routes.asyncHandler(this.weekdaysController.delete));
        app
            .route("/weekdays/:name/timeslots")
            .get(Routes.asyncHandler(this.weekdaysController.getTimeslots))

        app
            .route("/timeslots")
            .get(Routes.asyncHandler(this.timeslotsController.index))
            .post(Routes.asyncHandler(this.timeslotsController.create));
        app
            .route("/timeslots/:id")
            .get(Routes.asyncHandler(this.timeslotsController.show))
            .put(Routes.asyncHandler(this.timeslotsController.update))
            .delete(Routes.asyncHandler(this.timeslotsController.delete));
        app
            .route("/timeslots/:id/booking")
            .get(Routes.asyncHandler(this.timeslotsController.getBooking));

        app
            .route("/bookings")
            .get(Routes.asyncHandler(this.bookingsController.index))
            .post(Routes.asyncHandler(this.bookingsController.create));
        app
            .route("/bookings/:id")
            .get(Routes.asyncHandler(this.bookingsController.show))
            .put(Routes.asyncHandler(this.bookingsController.update))
            .delete(Routes.asyncHandler(this.bookingsController.delete));
    }
}
