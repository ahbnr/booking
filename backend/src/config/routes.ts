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
import { authHandler, optionalAuthHandler } from './passport';
import { ResourcesController } from '../controllers/resources.controller';
import DatabaseController from '../models';

export class Routes {
  private readonly usersController: UsersController;
  private readonly weekdaysController: WeekdaysController;
  private readonly resourcesController: ResourcesController;
  private readonly timeslotsController: TimeslotsController;
  private readonly bookingsController: BookingsController;

  constructor(db: DatabaseController) {
    this.usersController = new UsersController(db.repositories.userRepository);
    this.weekdaysController = new WeekdaysController(
      db.repositories.weekdayRepository,
      db.repositories.timeslotRepository
    );
    this.resourcesController = new ResourcesController(
      db.repositories.resourceRepository,
      db.repositories.weekdayRepository
    );
    this.timeslotsController = new TimeslotsController(
      db.repositories.timeslotRepository
    );
    this.bookingsController = new BookingsController(
      db.repositories.bookingRepository,
      this.timeslotsController
    );
  }

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
      .route('/users')
      .get(authHandler, Routes.asyncHandler(this.usersController.index));

    app
      .route('/users/:name')
      .delete(authHandler, Routes.asyncHandler(this.usersController.delete));

    app
      .route('/users/auth')
      .post(Routes.asyncHandler(this.usersController.auth));

    app
      .route('/users/inviteForSignup')
      .post(
        authHandler,
        Routes.asyncHandler(this.usersController.inviteForSignup)
      );

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
        Routes.asyncHandler(this.timeslotsController.getBookingsForTimeslot)
      )
      .post(Routes.asyncHandler(this.bookingsController.createBooking));

    app
      .route('/bookings')
      .get(
        optionalAuthHandler,
        Routes.asyncHandler(this.bookingsController.index)
      );
    app
      .route('/bookings/:id')
      .get(authHandler, Routes.asyncHandler(this.bookingsController.show))
      .put(authHandler, Routes.asyncHandler(this.bookingsController.update))
      .delete(
        optionalAuthHandler,
        Routes.asyncHandler(this.bookingsController.delete)
      );

    app
      .route('/bookings/inInterval')
      .post(
        authHandler,
        Routes.asyncHandler(this.bookingsController.getBookingsForDateInterval)
      );
  }
}
