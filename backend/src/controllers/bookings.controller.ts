import { Request, Response } from 'express';
import { DestroyOptions, UpdateOptions, Op } from 'sequelize';
import { Booking, VerificationTimeout } from '../models/booking.model';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/timeslot.model';
import { sendMail } from '../utils/email';
import { jwtSecret } from '../config/passport';
import { TimeslotsController } from './timeslots.controller';
import { asyncJwtSign, asyncJwtVerify } from '../utils/jwt';
import {
  BookingGetInterface,
  BookingPostInterface,
  checkType,
  EMailString,
  BookingWithContextGetInterface,
  noRefinementChecks,
  throwExpr,
  getCurrentTimeslotEndDate,
  getCurrentTimeslotStartDate,
} from 'common';
import { BookingLookupTokenData } from '../types/token-types/BookingLookupTokenData';
import { Resource } from '../models/resource.model';
import { BookingIntervalIndexRequestData, TimeslotData } from 'common/dist';
import BookingRepository from '../repositories/BookingRepository';
import ResourceRepository from '../repositories/ResourceRepository';
import BookingDBInterface from '../repositories/model_interfaces/BookingDBInterface';
import TypesafeRequest from './TypesafeRequest';
import { UnprocessableEntity } from './errors';

@boundClass
export class BookingsController {
  private readonly bookingRepository: BookingRepository;
  private readonly timeslotController: TimeslotsController;

  constructor(
    bookingRepository: BookingRepository,
    timeslotController: TimeslotsController
  ) {
    this.bookingRepository = bookingRepository;
    this.timeslotController = timeslotController;
  }

  private static bookingsAsGetInterfaces(
    bookings: BookingDBInterface[]
  ): BookingGetInterface[] {
    return bookings.map((booking) => booking.toGetInterface());
  }

  public async index(req: Request, res: Response<BookingGetInterface[]>) {
    const lookupToken = req.query.token;

    if (lookupToken != null && typeof lookupToken === 'string') {
      const bookingsWithMail = await this.listBookingsByLookupToken(
        lookupToken
      );

      // When listing bookings with a token, the bookings get automatically verified
      for (const booking of bookingsWithMail) {
        await booking.markAsVerified();
      }

      const result: BookingGetInterface[] = BookingsController.bookingsAsGetInterfaces(
        bookingsWithMail
      );

      res.json(result);
    } else if (req.authenticated) {
      const bookings = await this.bookingRepository.findAll();

      res.json(BookingsController.bookingsAsGetInterfaces(bookings));
    } else {
      res.status(401).json();
    }
  }

  public async getBookingsForDateInterval(
    req: Request,
    res: Response<BookingWithContextGetInterface[]>
  ) {
    const reqData = checkType(req.body, BookingIntervalIndexRequestData);

    const bookings = await this.bookingRepository.findInInterval(
      reqData.start,
      reqData.end
    );

    const bookingsWithContext: Promise<
      BookingWithContextGetInterface
    >[] = bookings.map(
      async (booking): Promise<BookingWithContextGetInterface> => {
        const resource = await booking.getResource();

        return {
          ...booking.toGetInterface(),
          resource: await resource.toGetInterface(),
        };
      }
    );

    res.json(await Promise.all(bookingsWithContext));
  }

  public async show(req: Request, res: Response<BookingGetInterface>) {
    const bookingId = this.bookingIdFromRequest(req);
    const booking = await this.bookingRepository.findById(bookingId);

    if (booking != null) {
      res.json(booking.toGetInterface());
    } else {
      res.status(404).json();
    }
  }

  public async createBooking(
    req: Request,
    res: Response<BookingGetInterface | string>
  ) {
    const timeslot = await this.timeslotController.getTimeslot(req);
    const bookingPostData = checkType(req.body, BookingPostInterface);

    const booking = await this.bookingRepository.create(
      timeslot,
      bookingPostData
    );

    await BookingsController.sendBookingLookupMail(
      bookingPostData.lookupUrl,
      booking
    );

    res.status(201).json(booking.toGetInterface());
  }

  private static async createBookingLookupToken(
    booking: BookingDBInterface
  ): Promise<string> {
    const email = checkType(booking.data.email, EMailString);
    const validDuration = await booking.timeTillDue();
    const secondsUntilExpiration = Math.floor(
      validDuration.shiftTo('seconds').seconds
    );

    const data: BookingLookupTokenData = {
      type: 'BookingLookupToken',
      email: email,
    };

    return await asyncJwtSign(data, jwtSecret, {
      expiresIn: secondsUntilExpiration,
    });
  }

  private static async sendBookingLookupMail(
    lookupUrl: string,
    booking: BookingDBInterface
  ) {
    const lookupToken = await BookingsController.createBookingLookupToken(
      booking
    );

    const timeslot = await booking.getTimeslot();
    const weekday = await timeslot.getWeekday();
    const resourceName = weekday.resourceName;

    await sendMail(
      booking.data.email,
      'Ihre Buchung',
      '', // TODO text representation
      `
        <p>
          Sie haben die Ressource "${resourceName}" am ${weekday.data.name} von ${booking.startDate} bis ${booking.endDate} gebucht.<br />
          Klicken Sie auf diesen Link um ihre Buchung zu bestätigen:
        </p>
        <a href="${lookupUrl}?lookupToken=${lookupToken}">Bestätigen und Buchungen einsehen</a>
        <p>
          IHRE BUCHUNG VERFÄLLT AUTOMATISCH NACH ${VerificationTimeout} WENN SIE NICHT BESTÄTIGT WIRD.
        </p>
        <p>
          Sie können den Link auch verwenden um alle Buchungen auf diese E-Mail Adresse einzusehen.
        </p>
      `
    ); // FIXME: Formatting
  }

  private async listBookingsByLookupToken(
    lookupToken: string
  ): Promise<BookingDBInterface[]> {
    const verifiedToken = await asyncJwtVerify(lookupToken, jwtSecret);

    const tokenData = checkType(verifiedToken, BookingLookupTokenData);

    return this.bookingRepository.findByEmail(tokenData.email);
  }

  private async getBookingByToken(
    bookingId: number,
    lookupToken: string
  ): Promise<BookingDBInterface | null> {
    const verifiedToken = await asyncJwtVerify(lookupToken, jwtSecret);

    const tokenData = checkType(verifiedToken, BookingLookupTokenData);

    const matchingBookings = await this.bookingRepository.findByEmail(
      tokenData.email,
      bookingId
    );

    if (matchingBookings.length > 0) {
      return matchingBookings[0];
    } else {
      return null;
    }
  }

  public async update(req: Request, res: Response) {
    const bookingPostData = checkType(req.body, BookingPostInterface);

    const updatedBooking = await this.bookingRepository.update(
      this.bookingIdFromRequest(req),
      bookingPostData
    );

    await BookingsController.sendBookingLookupMail(
      bookingPostData.lookupUrl,
      updatedBooking
    );

    res.status(202).json({ data: 'success' });
  }

  public async delete(req: Request, res: Response) {
    const bookingId = parseInt(req.params.id);
    const lookupToken = req.query.token;

    if (lookupToken != null && typeof lookupToken === 'string') {
      const maybeBooking = await this.getBookingByToken(bookingId, lookupToken);

      if (maybeBooking != null) {
        await maybeBooking.destroy();

        res.status(204).json();
      } else {
        res.status(404).json();
      }
    } else if (req.authenticated) {
      // FIXME: Also implement 404 here

      await this.bookingRepository.destroy(bookingId);

      res.status(204).json({ data: 'success' });
    } else {
      res.status(401).json();
    }
  }

  private bookingIdFromRequest(req: Request): number {
    const maybeId = parseInt(req.params.id);

    if (isNaN(maybeId)) {
      throw new UnprocessableEntity('No numeric booking id given.');
    } else {
      return maybeId;
    }
  }
}
