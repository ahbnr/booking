import { Response } from 'express';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { TimeslotsController } from './timeslots.controller';
import { asyncJwtVerify } from '../utils/jwt';
import {
  BookingGetInterface,
  BookingsCreateInterface,
  BookingsCreateResponseInterface,
  BookingUpdateInterface,
  checkType,
  hasProperty,
  IBookingLookupPdfRequest,
  ISO8601,
  NonEmptyString,
  noRefinementChecks,
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
import UnreliableMailDomainRepository from '../repositories/UnreliableMailDomainRepository';

@singleton()
@boundClass
export class BookingsController {
  constructor(
    @inject(delay(() => BookingRepository))
    private readonly bookingRepository: BookingRepository,

    @inject(delay(() => SettingsRepository))
    private readonly settingsRepository: SettingsRepository,

    @inject(delay(() => UnreliableMailDomainRepository))
    private readonly unreliableMailDomainRepository: UnreliableMailDomainRepository,

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

  public async getLookupPdf(req: TypesafeRequest, res: Response) {
    const bookingId = extractNumericIdFromRequest(req);
    const requestData = checkType(req.body, IBookingLookupPdfRequest);

    const verifiedToken = await asyncJwtVerify(requestData.lookupToken);

    const tokenContent = checkType(verifiedToken, BookingLookupTokenData);

    const booking = await this.bookingRepository.findById(bookingId);

    if (booking != null) {
      if (tokenContent.email !== booking?.email) {
        /**
         * FIXME: We should also check, if there was actually a problem with sending the confirmation mail for this
         * booking, because this PDF allows to circumvent mail verification by the included lookup link.
         *
         * Currently the frontend prevents misuse by normal users,
         * but this scenario is still possible by direct API accesses
         */
        res
          .status(401)
          .json(
            'E-Mail of the booking does not match e-mail of the lookup token.'
          );
      } else {
        const timeslot = await booking.getTimeslot();

        const pdfStream = await this.bookingRepository.genBookingLookupPdf(
          requestData.lookupUrl,
          requestData.lookupToken,
          booking,
          timeslot
        );

        res.attachment(
          `SGI Flieden Buchung ${DateTime.fromJSDate(booking.startDate)
            .setLocale('de-DE')
            .toLocaleString({ ...DateTime.DATE_SHORT })}.pdf`
        );
        pdfStream.pipe(res);
      }
    } else {
      res.status(404).json();
    }
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
    res: Response<BookingsCreateResponseInterface | string>
  ) {
    const timeslot = await this.timeslotController.getTimeslot(req);
    const bookingCreateData = checkType(req.body, BookingsCreateInterface);

    const settings = await this.settingsRepository.get();

    const modificationOptions = this.genBookingModificationOptions(
      req,
      settings.data
    );
    const bookings = await this.bookingRepository.create(
      timeslot,
      bookingCreateData,
      modificationOptions
    );

    try {
      const bookingsToReturn: BookingGetInterface[] = bookings.map((booking) =>
        booking.toGetInterface()
      );

      let status_code = 201;
      let status_text: 'ok' | 'mail_undeliverable' = 'ok';
      const firstBooking = bookings[0];

      const lookupToken =
        firstBooking.email != null
          ? await BookingRepository.createBookingLookupToken(firstBooking)
          : undefined;

      let isMailDomainUnreliable: BookingsCreateResponseInterface['isMailDomainUnreliable'] = undefined;

      if (firstBooking.email != null) {
        // Mail addresses are actually complex:
        // https://en.wikipedia.org/wiki/Email_address
        // Also, for extracting the domain, a sophisticated parser should also be used https://stackoverflow.com/a/49893282
        // However, since providing a lookup PDF in case of an unreliable mail domain is not a critical feature and most
        // users will enter simple mail addresses, we just take the part after the last '@' as the domain here
        const splitMail = firstBooking.email.split('@');
        if (splitMail.length >= 2) {
          const mailDomain = splitMail[splitMail.length - 1];

          isMailDomainUnreliable = await this.unreliableMailDomainRepository.isMailDomainUnreliable(
            mailDomain
          );
        }

        const sendResult = await this.bookingRepository.sendBookingLookupMail(
          bookingCreateData.lookupUrl,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          lookupToken!,
          firstBooking,
          timeslot
        );

        if (!sendResult) {
          status_text = 'mail_undeliverable';

          if (settings.data.requireMailConfirmation && !req.authenticated) {
            await this.bookingRepository.destroy(
              bookings.map((booking) => booking.id)
            );

            status_code = 500;
          }
        }
      } else if (modificationOptions.requireMail) {
        res.status(400).json('Missing E-Mail');
        return;
      }

      res.status(status_code).json(
        noRefinementChecks({
          status: status_text,
          bookings: bookingsToReturn,
          lookupToken,
          isMailDomainUnreliable,
        })
      );
    } catch (e) {
      await this.bookingRepository.destroy(
        bookings.map((booking) => booking.id)
      );

      throw e;
    }
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
