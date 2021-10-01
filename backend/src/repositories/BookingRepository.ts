import { Booking, VerificationTimeout } from '../models/booking.model';
import { Timeslot } from '../models/timeslot.model';
import { DestroyOptions, Op, WhereOptions } from 'sequelize';
import { Weekday } from '../models/weekday.model';
import { Resource } from '../models/resource.model';
import BookingDBInterface from './model_interfaces/BookingDBInterface';
import { boundClass } from 'autobind-decorator';
import {
  assertNever,
  BookingsCreateInterface,
  BookingUpdateInterface,
  checkType,
  EMailString,
  throwExpr,
} from 'common';
import ResourceRepository from './ResourceRepository';
import ResourceDBInterface from './model_interfaces/ResourceDBInterface';
import TimeslotDBInterface from './model_interfaces/TimeslotDBInterface';
import { Conflict, UnprocessableEntity } from '../controllers/errors';
import TimeslotRepository from './TimeslotRepository';
import { NoElementToUpdate } from './errors';
import '../utils/array_extensions';
import getBookingInterval from '../date_math/getBookingInterval';
import { DateTime } from 'luxon';
import SettingsRepository from './SettingsRepository';
import { delay, inject, singleton } from 'tsyringe';
import { MailTransporter } from '../mail/MailTransporter';
import { BookingLookupTokenData } from '../types/token-types/BookingLookupTokenData';
import { asyncJwtSign } from '../utils/jwt';
import { genBookingConfirmation } from '../docgen/GenBookingConfirmation';
import dedent from 'dedent-js';
import BackendConfig from '../booking-backend.config';
import BlockedDateRepository from './BlockedDateRepository';

@singleton()
@boundClass
export default class BookingRepository {
  constructor(
    @inject(delay(() => ResourceRepository))
    private readonly resourceRepository: ResourceRepository,

    @inject(delay(() => TimeslotRepository))
    private readonly timeslotRepository: TimeslotRepository,

    @inject(delay(() => SettingsRepository))
    private readonly settingsRepository: SettingsRepository,

    @inject(delay(() => BlockedDateRepository))
    private readonly blockedDateRepository: BlockedDateRepository,

    @inject('MailTransporter')
    private readonly mailTransporter: MailTransporter
  ) {}

  public toInterface(booking: Booking): BookingDBInterface {
    return new BookingDBInterface(booking, this);
  }

  private async createOrModifyBookings(
    mode: BookingModificationMode,
    options: BookingModificationOptions
  ): Promise<BookingDBInterface[] | BookingDBInterface> {
    let timeslot: TimeslotDBInterface;
    switch (mode.kind) {
      case 'modify':
        timeslot = this.timeslotRepository.toInterface(
          await mode.toModify.lazyTimeslot
        );
        break;
      case 'create':
        timeslot = mode.timeslot;
        break;
      default:
        assertNever();
    }

    const weekday = await timeslot.getWeekday();
    const settings = await this.settingsRepository.get();
    const bookingDay = DateTime.fromISO(mode.data.bookingDay);

    if (options.requireMail && mode.data.email == null) {
      throw new UnprocessableEntity('The E-Mail field may not be empty.');
    }

    const bookingValidation = await getBookingInterval(
      bookingDay,
      weekday.data.name,
      timeslot.data,
      settings,
      this.blockedDateRepository,
      options.ignoreDeadlines,
      options.ignoreMaxWeekDistance,
      options.ignoreBlockedDates
    );

    // noinspection UnreachableCodeJS
    switch (bookingValidation.kind) {
      case 'error':
        throw new UnprocessableEntity(
          `Invalid booking date: ${bookingValidation.error}`
        );
      case 'success':
        {
          const bookings = await timeslot.getBookings(bookingDay);

          const startDate = bookingValidation.result.start.toJSDate();
          const endDate = bookingValidation.result.end.toJSDate();
          const timeslotId = timeslot.id;

          switch (mode.kind) {
            case 'create': {
              if (
                bookings.length + mode.data.participantNames.length >
                  timeslot.data.capacity &&
                !options.allowToExceedCapacity
              ) {
                throw new Conflict(
                  'The timeslot has reached max. capacity. This amount of bookings can not be created.'
                );
              }

              const dbDatas = mode.data.participantNames.map((name) => ({
                name,
                email: mode.data.email,
                bookingDay: mode.data.bookingDay,
                lookupUrl: mode.data.lookupUrl,
                startDate,
                endDate,
                timeslotId,
                isVerified: options.autoVerify,
              }));

              const newBookings = await Booking.bulkCreate<Booking>(dbDatas);
              const firstBooking = newBookings[0];

              if (firstBooking.email != null) {
                await this.sendBookingLookupMail(
                  mode.data.lookupUrl,
                  firstBooking,
                  timeslot
                );
              }

              return newBookings.map((booking) => this.toInterface(booking));
            }

            case 'modify': {
              const dbData = {
                name: mode.data.name,
                email: mode.data.email,
                bookingDay: mode.data.bookingDay,
                lookupUrl: mode.data.lookupUrl,
                startDate,
                endDate,
                timeslotId,
              };

              const booking = await mode.toModify.update(dbData);
              return this.toInterface(booking);
            }

            default:
              assertNever();
          }
        }
        // noinspection UnreachableCodeJS
        break;
      default:
        return assertNever();
    }
  }

  public async create(
    timeslot: TimeslotDBInterface,
    bookingCreateData: BookingsCreateInterface,
    options: BookingModificationOptions
  ): Promise<BookingDBInterface[]> {
    const bookings = (await this.createOrModifyBookings(
      { kind: 'create', timeslot, data: bookingCreateData },
      options
    )) as BookingDBInterface[];

    return bookings;
  }

  public async findAll(
    whereOptions?: WhereOptions
  ): Promise<BookingDBInterface[]> {
    const bookings = await Booking.findAll({
      include: [Timeslot],
      where: whereOptions,
    });

    const clearedBookings = await BookingRepository.filterOutdatedBookings(
      bookings
    );

    return clearedBookings.map(this.toInterface);
  }

  public async findInInterval(
    start: DateTime,
    end: DateTime
  ): Promise<BookingDBInterface[]> {
    const startDateString = start.toISO();
    const endDateString = end.toISO();

    const foundBookings = await Booking.findAll<Booking>({
      where: {
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDateString, endDateString],
            },
          },
          {
            endDate: {
              [Op.between]: [startDateString, endDateString],
            },
          },
        ],
      },
      include: [
        {
          model: Timeslot,
          include: [
            {
              model: Weekday,
              include: [Resource],
            },
          ],
        },
      ],
    });

    const clearedBookings = await BookingRepository.filterOutdatedBookings(
      foundBookings
    );

    return clearedBookings.map(this.toInterface);
  }

  public async findByEmail(
    email: EMailString,
    bookingId?: number
  ): Promise<BookingDBInterface[]> {
    let bookings;

    if (bookingId == null) {
      bookings = await Booking.findAll({
        where: { email: email },
      });
    } else {
      bookings = await Booking.findAll({
        where: { id: bookingId, email: email },
      });
    }

    const clearedBookings = await BookingRepository.filterOutdatedBookings(
      bookings
    );

    return clearedBookings.map(this.toInterface);
  }

  public async findById(bookingId: number): Promise<BookingDBInterface | null> {
    const maybeBooking = await this.findByIdInternal(bookingId);

    if (maybeBooking != null) {
      return this.toInterface(maybeBooking);
    }

    return null;
  }

  private async findByIdInternal(bookingId: number): Promise<Booking | null> {
    const maybeBooking = await Booking.findByPk<Booking>(bookingId, {
      include: [Timeslot],
    });

    if (maybeBooking != null && (await maybeBooking.hasPassed())) {
      await maybeBooking.destroy();

      return null;
    } else {
      return maybeBooking;
    }
  }

  public async update(
    id: number,
    data: BookingUpdateInterface,
    options: BookingModificationOptions
  ): Promise<BookingDBInterface> {
    const maybeBooking = await this.findByIdInternal(id);

    if (maybeBooking != null) {
      const modifiedBooking = (await this.createOrModifyBookings(
        { kind: 'modify', toModify: maybeBooking, data },
        options
      )) as BookingDBInterface;

      return modifiedBooking;
    } else {
      throw new NoElementToUpdate('booking');
    }
  }

  public async destroy(bookingId: number) {
    const options: DestroyOptions = {
      where: { id: bookingId },
      limit: 1,
    };

    await Booking.destroy(options);
  }

  public getResourceOfBooking(booking: Booking): ResourceDBInterface {
    const resourceRaw =
      booking.timeslot?.weekday?.resource ||
      throwExpr<Resource>(
        new Error(
          'Can not retrieve resource directly. Make sure this booking interface is retrieved by a findAll request that includes the timeslot, the weekday and the resource.'
        )
      );

    return this.resourceRepository.toInterface(resourceRaw);
  }

  public async clearAllOutdatedBookings() {
    const now = DateTime.local();

    const verificationExpired = {
      [Op.and]: [
        {
          isVerified: false,
        },
        {
          createdAt: {
            [Op.lte]: now.minus(VerificationTimeout).toJSDate(),
          },
        },
      ],
    };

    const endDateReached = {
      endDate: {
        [Op.lte]: now.toJSDate(),
      },
    };

    const numDeletedBookings = await Booking.destroy({
      where: {
        [Op.or]: [verificationExpired, endDateReached],
      },
    });
    console.log(`Cleared ${numDeletedBookings} outdated/unverified bookings.`);
  }

  private static async filterOutdatedBookings(
    bookings: Booking[]
  ): Promise<Booking[]> {
    const [old_bookings, valid_bookings] = bookings.partition((booking) =>
      booking.hasPassed()
    );

    for (const booking of old_bookings) {
      await booking.destroy();
    }

    return valid_bookings;
  }

  private static async createBookingLookupToken(
    booking: Booking
  ): Promise<string> {
    const email = checkType(booking.email, EMailString);
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

  private async sendBookingLookupMail(
    lookupUrl: string,
    booking: Booking,
    timeslot: TimeslotDBInterface
  ) {
    if (booking.email == null) {
      throw Error(
        'This booking has no email. This is a programming error and should never happen.'
      );
    }

    const lookupToken = await BookingRepository.createBookingLookupToken(
      booking
    );

    const settings = await this.settingsRepository.get();

    const bookingConfirmationTexts = await genBookingConfirmation(
      lookupUrl,
      booking,
      timeslot,
      lookupToken,
      settings
    );

    await this.mailTransporter.send(
      booking.email,
      bookingConfirmationTexts.title,
      dedent`
          ${bookingConfirmationTexts.intro}
          
          ${bookingConfirmationTexts.timeString}
          
          ${bookingConfirmationTexts.linkIntro}
          
          ${bookingConfirmationTexts.lookupLink}
          
          ${bookingConfirmationTexts.linkPrimaryHint || ''}
          
          ${bookingConfirmationTexts.linkSecondaryHint || ''}
          
          ${dedent(BackendConfig.mailFooterText || '')}
      `,
      dedent`
        <p>
          ${bookingConfirmationTexts.intro}
          <p>
            <i style="margin-left: 2em">
                ${bookingConfirmationTexts.timeString}
            </i>
          </p>
        </p>
        <p>
          ${bookingConfirmationTexts.linkIntro}
        </p>
        <a href="${bookingConfirmationTexts.lookupLink}">${
        bookingConfirmationTexts.linkText
      }</a>
        ${
          bookingConfirmationTexts.linkPrimaryHint
            ? dedent`
                <p>
                  <b style="font-size: 1.5em;">
                    ${bookingConfirmationTexts.linkPrimaryHint}
                  </b>
                </p>
              `
            : ''
        }
        ${
          bookingConfirmationTexts.linkSecondaryHint
            ? dedent`
              <p>
                ${bookingConfirmationTexts.linkSecondaryHint}
              </p>
            `
            : ''
        }
        
        ${dedent(BackendConfig.mailFooterHtml || '')}
      `
    ); // FIXME: Formatting
  }
}

type BookingModificationMode =
  | {
      kind: 'create';
      timeslot: TimeslotDBInterface;
      data: BookingsCreateInterface;
    }
  | { kind: 'modify'; toModify: Booking; data: BookingUpdateInterface };

export interface BookingModificationOptions {
  ignoreDeadlines: boolean;
  ignoreMaxWeekDistance: boolean;
  ignoreBlockedDates: boolean;
  requireMail: boolean;
  autoVerify: boolean;
  allowToExceedCapacity: boolean;
}
