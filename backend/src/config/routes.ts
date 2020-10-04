import {
  Application,
  NextFunction,
  RequestHandler,
  Request,
  Response,
} from 'express';
import { WeekdaysController } from '../controllers/weekdays.controller';
import { TimeslotsController } from '../controllers/timeslots.controller';
import { BookingsController } from '../controllers/bookings.controller';
import { UsersController } from '../controllers/users.controller';
import { authHandler } from './passport';
import { ResourcesController } from '../controllers/resources.controller';

export class Routes {
  private usersController: UsersController = new UsersController();
  private resourcesController: ResourcesController = new ResourcesController();
  private weekdaysController: WeekdaysController = new WeekdaysController();
  private timeslotsController: TimeslotsController = new TimeslotsController();
  private bookingsController: BookingsController = new BookingsController();

  private static asyncHandler<T>(
    handler: (req: Request, res: Response, next?: NextFunction) => Promise<T>
  ): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      handler(req, res, next).catch(next);
    };
  }

  public routes(app: Application): void {
    app.route('/').get((req, res) => res.json('Hello'));

    app
      .route('/users/auth')
      .post(Routes.asyncHandler(this.usersController.auth));

    app
      .route('/resources')
      .get(Routes.asyncHandler(this.resourcesController.index));

    app
      .route('/resources/:name')
      .get(Routes.asyncHandler(this.resourcesController.show))
      .post(authHandler, Routes.asyncHandler(this.resourcesController.create))
      .put(authHandler, Routes.asyncHandler(this.resourcesController.update))
      .delete(
        authHandler,
        Routes.asyncHandler(this.resourcesController.delete)
      );

    app
      .route('/resources/:name/weekdays')
      .get(Routes.asyncHandler(this.resourcesController.getWeekdays))
      .post(
        authHandler,
        Routes.asyncHandler(this.resourcesController.createWeekday)
      );

    app
      .route('/weekdays')
      .get(Routes.asyncHandler(this.weekdaysController.index));
    app
      .route('/weekdays/:id')
      .get(Routes.asyncHandler(this.weekdaysController.show))
      .put(authHandler, Routes.asyncHandler(this.weekdaysController.update))
      .delete(authHandler, Routes.asyncHandler(this.weekdaysController.delete));
    app
      .route('/weekdays/:id/timeslots')
      .get(Routes.asyncHandler(this.weekdaysController.getTimeslots))
      .post(
        authHandler,
        Routes.asyncHandler(this.weekdaysController.createTimeslot)
      );

    app
      .route('/timeslots')
      .get(Routes.asyncHandler(this.timeslotsController.index));
    app
      .route('/timeslots/:id')
      .get(Routes.asyncHandler(this.timeslotsController.show))
      .put(authHandler, Routes.asyncHandler(this.timeslotsController.update))
      .delete(
        authHandler,
        Routes.asyncHandler(this.timeslotsController.delete)
      );
    app
      .route('/timeslots/:id/bookings')
      .get(
        authHandler,
        Routes.asyncHandler(this.timeslotsController.getBookings)
      )
      .post(Routes.asyncHandler(this.timeslotsController.createBooking));

    app
      .route('/bookings')
      .get(authHandler, Routes.asyncHandler(this.bookingsController.index));
    app
      .route('/bookings/:id')
      .get(authHandler, Routes.asyncHandler(this.bookingsController.show))
      .put(authHandler, Routes.asyncHandler(this.bookingsController.update))
      .delete(authHandler, Routes.asyncHandler(this.bookingsController.delete));
  }
}
