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

const { DEV_MODE } = process.env;

export class Routes {
  private readonly db: DatabaseController;

  private readonly usersController: UsersController;
  private readonly weekdaysController: WeekdaysController;
  private readonly resourcesController: ResourcesController;
  private readonly timeslotsController: TimeslotsController;
  private readonly bookingsController: BookingsController;
  private readonly authController: AuthController;
  private readonly settingsController: SettingsController;

  constructor(db: DatabaseController) {
    this.db = db;

    this.usersController = new UsersController(db.repositories.userRepository);
    this.weekdaysController = new WeekdaysController(
      db.repositories.weekdayRepository,
      db.repositories.timeslotRepository,
      db.repositories.settingsRepository
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
      db.repositories.settingsRepository,
      this.timeslotsController
    );
    this.authController = new AuthController(
      db.repositories.userRepository,
      db.repositories.refreshTokenRepository
    );
    this.settingsController = new SettingsController(
      db.repositories.settingsRepository
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
      .route('/timeslots/:id/bookings/:dayDate')
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

    app
      .route('/settings')
      .get(Routes.asyncHandler(this.settingsController.show))
      .put(authHandler, Routes.asyncHandler(this.settingsController.update));
  }
}
