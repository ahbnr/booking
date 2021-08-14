import { Response } from 'express';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { TimeslotsController } from './timeslots.controller';
import { asyncJwtVerify } from '../utils/jwt';
import {
  BookingGetInterface,
  BookingPostInterface,
  checkType,
  BookingWithContextGetInterface,
} from 'common';
import { BookingLookupTokenData } from '../types/token-types/BookingLookupTokenData';
import { BookingIntervalIndexRequestData } from 'common/dist';
import BookingRepository, {
  BookingModificationOptions,
} from '../repositories/BookingRepository';
import BookingDBInterface from '../repositories/model_interfaces/BookingDBInterface';
import TypesafeRequest from './TypesafeRequest';
import { extractNumericIdFromRequest } from './utils';
import SettingsRepository from '../repositories/SettingsRepository';
import { delay, inject, singleton } from 'tsyringe';

@singleton()
@boundClass
export class BookingsController {
  constructor(
    @inject(delay(() => BookingRepository))
    private readonly bookingRepository: BookingRepository,

    @inject(delay(() => SettingsRepository))
    private readonly settingsRepository: SettingsRepository,

    @inject(delay(() => TimeslotsController))
    private readonly timeslotController: TimeslotsController
  ) {}

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

  private genBookingModificationOptions(
    req: TypesafeRequest
  ): BookingModificationOptions {
    const isAuthenticated = req.isAuthenticated();
    return {
      ignoreMaxWeekDistance: isAuthenticated,
      ignoreDeadlines: isAuthenticated,
      requireMail: !isAuthenticated,
      autoVerify: isAuthenticated,
      allowToExceedCapacity: isAuthenticated,
    };
  }

  public async createBooking(
    req: TypesafeRequest,
    res: Response<BookingGetInterface | string>
  ) {
    const timeslot = await this.timeslotController.getTimeslot(req);
    const bookingPostData = checkType(req.body, BookingPostInterface);

    const booking = await this.bookingRepository.create(
      timeslot,
      bookingPostData,
      this.genBookingModificationOptions(req)
    );

    res.status(201).json(booking.toGetInterface());
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
      bookingPostData,
      this.genBookingModificationOptions(req)
    );

    res.status(202).json(updatedBooking.toGetInterface());
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
