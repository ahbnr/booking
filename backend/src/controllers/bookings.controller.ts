import { Response } from 'express';
import { VerificationTimeout } from '../models/booking.model';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { sendMail } from '../utils/email';
import { i18nextInstance } from '../utils/i18n';
import { TimeslotsController } from './timeslots.controller';
import { asyncJwtSign, asyncJwtVerify } from '../utils/jwt';
import {
  BookingGetInterface,
  BookingPostInterface,
  checkType,
  EMailString,
  BookingWithContextGetInterface,
} from 'common';
import { BookingLookupTokenData } from '../types/token-types/BookingLookupTokenData';
import { BookingIntervalIndexRequestData } from 'common/dist';
import BookingRepository from '../repositories/BookingRepository';
import BookingDBInterface from '../repositories/model_interfaces/BookingDBInterface';
import TypesafeRequest from './TypesafeRequest';
import { extractNumericIdFromRequest } from './utils';
import humanizeDuration from 'humanize-duration';

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

  public async index(
    req: TypesafeRequest,
    res: Response<BookingGetInterface[]>
  ) {
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
    req: TypesafeRequest,
    res: Response<BookingWithContextGetInterface[]>
  ) {
    const reqData = checkType(req.body, BookingIntervalIndexRequestData);

    const bookings = await this.bookingRepository.findInInterval(
      reqData.start,
      reqData.end
    );

    const bookingsWithContext: Promise<BookingWithContextGetInterface>[] = bookings.map(
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

  public async show(req: TypesafeRequest, res: Response<BookingGetInterface>) {
    const bookingId = extractNumericIdFromRequest(req);
    const booking = await this.bookingRepository.findById(bookingId);

    if (booking != null) {
      res.json(booking.toGetInterface());
    } else {
      res.status(404).json();
    }
  }

  public async createBooking(
    req: TypesafeRequest,
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

    const tokenResult = await asyncJwtSign(data, {
      expiresIn: secondsUntilExpiration,
    });

    return tokenResult.token;
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
          Sie haben die Ressource
          <p>
            <i style="margin-left: 2em">
              "${resourceName}"
              am
              ${i18nextInstance.t(weekday.data.name)}
              von
              ${booking.startDate.toLocaleTimeString('de-DE')}
              bis
              ${booking.endDate.toLocaleTimeString('de-DE')}
            </i>
          </p>
          gebucht.<br />
          
          Klicken Sie auf diesen Link um ihre Buchung zu bestätigen:
        </p>
        <a href="${lookupUrl}?lookupToken=${lookupToken}">Bestätigen und Buchungen einsehen</a>
        <p>
          <b style="font-size: 1.5em;">
            IHRE BUCHUNG VERFÄLLT AUTOMATISCH NACH
            ${humanizeDuration(VerificationTimeout.toMillis(), {
              language: 'de',
            }).toUpperCase()}
            WENN SIE NICHT BESTÄTIGT WIRD.
          </b>
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
    const verifiedToken = await asyncJwtVerify(lookupToken);

    const tokenData = checkType(verifiedToken, BookingLookupTokenData);

    return this.bookingRepository.findByEmail(tokenData.email);
  }

  private async getBookingByToken(
    bookingId: number,
    lookupToken: string
  ): Promise<BookingDBInterface | null> {
    const verifiedToken = await asyncJwtVerify(lookupToken);

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

  public async update(req: TypesafeRequest, res: Response) {
    const bookingPostData = checkType(req.body, BookingPostInterface);

    const updatedBooking = await this.bookingRepository.update(
      extractNumericIdFromRequest(req),
      bookingPostData
    );

    await BookingsController.sendBookingLookupMail(
      bookingPostData.lookupUrl,
      updatedBooking
    );

    res.status(202).json({ data: 'success' });
  }

  public async delete(req: TypesafeRequest, res: Response) {
    const bookingId = extractNumericIdFromRequest(req);
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
}
