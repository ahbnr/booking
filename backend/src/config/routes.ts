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
import { AuthController } from '../controllers/auth.controller';
import { SettingsController } from '../controllers/settings.controller';
import { delay, inject, singleton } from 'tsyringe';

const { DEV_MODE } = process.env;

@singleton()
export class Routes {
  constructor(
    @inject(DatabaseController)
    private readonly db: DatabaseController,

    @inject(delay(() => UsersController))
    private readonly usersController: UsersController,

    @inject(delay(() => WeekdaysController))
    private readonly weekdaysController: WeekdaysController,

    @inject(delay(() => ResourcesController))
    private readonly resourcesController: ResourcesController,

    @inject(delay(() => TimeslotsController))
    private readonly timeslotsController: TimeslotsController,

    @inject(delay(() => BookingsController))
    private readonly bookingsController: BookingsController,

    @inject(delay(() => AuthController))
    private readonly authController: AuthController,

    @inject(delay(() => SettingsController))
    private readonly settingsController: SettingsController
  ) {}

  private static asyncHandler<T>(
    handler: (req: Request, res: Response, next?: NextFunction) => Promise<T>
  ): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      handler(req, res, next).catch(next);
    };
  }

  public routes(app: Application): void {
    app.route('/').get((req, res) => res.json('Hello'));

    if (DEV_MODE === '1') {
      app.route('/reset').post(
        Routes.asyncHandler(async (req, res) => {
          await this.db.reset();

          res.status(200).json({});
        })
      );
    }

    app
      .route('/auth/login')
      .post(Routes.asyncHandler(this.authController.login));

    app
      .route('/auth/logout')
      .post(Routes.asyncHandler(this.authController.logout));

    app
      .route('/auth/auth_token')
      .get(Routes.asyncHandler(this.authController.getAuthToken));

    app
      .route('/auth/invite')
      .post(
        authHandler,
        Routes.asyncHandler(this.authController.inviteForSignup)
      );

    app
      .route('/auth/is_signup_token_ok')
      .post(Routes.asyncHandler(this.authController.isSignupTokenOk));

    app
      .route('/auth/signup')
      .post(Routes.asyncHandler(this.authController.signup));

    app
      .route('/users')
      .get(authHandler, Routes.asyncHandler(this.usersController.index));

    app
      .route('/users/:name')
      .delete(authHandler, Routes.asyncHandler(this.usersController.delete));

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
      .route('/weekdays/:id/bookingConditions')
      .get(Routes.asyncHandler(this.weekdaysController.getBookingConditions));

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
      .post(
        optionalAuthHandler,
        Routes.asyncHandler(this.bookingsController.createBooking)
      );
    app
      .route('/timeslots/:id/bookings/:dayDate')
      .get(
        authHandler,
        Routes.asyncHandler(this.timeslotsController.getBookingsForTimeslot)
      );

    app
      .route('/timeslots/:id/bookings/:dayDate/count')
      .get(
        Routes.asyncHandler(this.timeslotsController.countBookingsForTimeslot)
      );

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

    app
      .route('/settings')
      .get(Routes.asyncHandler(this.settingsController.show))
      .put(authHandler, Routes.asyncHandler(this.settingsController.update));
  }
}
