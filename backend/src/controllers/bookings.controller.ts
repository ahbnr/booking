import { Response } from 'express';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { TimeslotsController } from './timeslots.controller';
import { asyncJwtVerify } from '../utils/jwt';
import {
  BookingGetInterface,
  BookingsCreateInterface,
  BookingUpdateInterface,
  checkType,
  hasProperty,
  ISO8601,
  NonEmptyString,
  ResourceGroupedBookings,
  ResourceGroupedBookingsGetInterface,
} from 'common';
import { BookingLookupTokenData } from '../types/token-types/BookingLookupTokenData';
import BookingRepository, {
  BookingModificationOptions,
} from '../repositories/BookingRepository';
import BookingDBInterface from '../repositories/model_interfaces/BookingDBInterface';
import TypesafeRequest from './TypesafeRequest';
import { extractNumericIdFromRequest } from './utils';
import SettingsRepository from '../repositories/SettingsRepository';
import { delay, inject, singleton } from 'tsyringe';
import { DateTime } from 'luxon';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/fp/map';
import orderBy from 'lodash/fp/orderBy';
import ReactPDF from '@react-pdf/renderer';
import renderDayOverviewPDF from '../pdf-rendering/RenderDayOverviewPDF';
import { MissingPathParameter } from './errors';
import { SettingsData } from 'common/dist/typechecking/api/Settings';

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

  private async computeBookingsForDay(date: DateTime) {
    const start = date.startOf('day');
    const end = date.endOf('day');
    const bookings = await this.bookingRepository.findInInterval(start, end);

    type GetInterfaceWithResourceName = {
      booking: BookingGetInterface;
      resourceName: NonEmptyString;
    };

    const resourceGroupedBookings: ResourceGroupedBookings[] = flow(
      map((booking: BookingDBInterface) => ({
        booking: booking.toGetInterface(),
        resourceName: booking.getResource().data.name,
      })),
      groupBy((data: GetInterfaceWithResourceName) => data.resourceName),
      map((dataList: GetInterfaceWithResourceName[]) => {
        const first = dataList[0];

        return {
          resourceName: first.resourceName,
          bookings: dataList.map((data) => data.booking),
        };
      }),
      orderBy((group: ResourceGroupedBookings) => group.bookings.length, [
        'desc',
      ])
    )(bookings);

    return resourceGroupedBookings;
  }

  private static retrieveDayDate(req: TypesafeRequest): DateTime {
    if (hasProperty(req.params, 'dayDate')) {
      const dateString = checkType(req.params.dayDate, ISO8601);
      const date = DateTime.fromISO(dateString);

      return date.startOf('day');
    } else {
      throw new MissingPathParameter('dayDate');
    }
  }

  public async getBookingsForDay(
    req: TypesafeRequest,
    res: Response<ResourceGroupedBookingsGetInterface[]>
  ) {
    const date = BookingsController.retrieveDayDate(req);

    const bookingsForDay = await this.computeBookingsForDay(date);

    res.json(bookingsForDay);
  }

  public async getDayOverviewPdf(req: TypesafeRequest, res: Response) {
    const date = BookingsController.retrieveDayDate(req);

    const resourceGroupedBookings = await this.computeBookingsForDay(date);

    const pdfStream = await ReactPDF.renderToStream(
      renderDayOverviewPDF(date, resourceGroupedBookings)
    );

    res.attachment(
      `Buchungsplan_${date
        .setLocale('de-DE')
        .toLocaleString({ ...DateTime.DATE_SHORT })}.pdf`
    );
    pdfStream.pipe(res);
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
    req: TypesafeRequest,
    settings: SettingsData
  ): BookingModificationOptions {
    const isAuthenticated = req.isAuthenticated();
    return {
      ignoreMaxWeekDistance: isAuthenticated,
      ignoreDeadlines: isAuthenticated,
      ignoreBlockedDates: isAuthenticated,
      requireMail: !isAuthenticated,
      autoVerify: isAuthenticated || !settings.requireMailConfirmation,
      allowToExceedCapacity: isAuthenticated,
    };
  }

  public async createBookings(
    req: TypesafeRequest,
    res: Response<BookingGetInterface[]>
  ) {
    const timeslot = await this.timeslotController.getTimeslot(req);
    const bookingCreateData = checkType(req.body, BookingsCreateInterface);

    const settings = await this.settingsRepository.get();

    const bookings = await this.bookingRepository.create(
      timeslot,
      bookingCreateData,
      this.genBookingModificationOptions(req, settings.data)
    );

    const returnData: BookingGetInterface[] = bookings.map((booking) =>
      booking.toGetInterface()
    );

    res.status(201).json(returnData);
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
    const bookingUpdateData = checkType(req.body, BookingUpdateInterface);
    const settings = await this.settingsRepository.get();

    const updatedBooking = await this.bookingRepository.update(
      extractNumericIdFromRequest(req),
      bookingUpdateData,
      this.genBookingModificationOptions(req, settings.data)
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
