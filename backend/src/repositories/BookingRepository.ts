import { Booking, VerificationTimeout } from '../models/booking.model';
import { Timeslot } from '../models/timeslot.model';
import { DestroyOptions, Op, WhereOptions } from 'sequelize';
import { Weekday } from '../models/weekday.model';
import { Resource } from '../models/resource.model';
import BookingDBInterface from './model_interfaces/BookingDBInterface';
import { boundClass } from 'autobind-decorator';
import {
  assertNever,
  BookingPostInterface,
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
import humanizeDuration from 'humanize-duration';
import { MailTransporter } from '../mail/MailTransporter';
import { BookingLookupTokenData } from '../types/token-types/BookingLookupTokenData';
import { asyncJwtSign } from '../utils/jwt';
import { i18nextInstance } from '../utils/i18n';

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

    @inject('MailTransporter')
    private readonly mailTransporter: MailTransporter
  ) {}

  public toInterface(booking: Booking): BookingDBInterface {
    return new BookingDBInterface(booking, this);
  }

  private async createOrModifyBooking(
    mode: BookingModificationMode,
    bookingPostData: BookingPostInterface,
    options: BookingModificationOptions
  ): Promise<BookingDBInterface> {
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
    const bookingDay = DateTime.fromISO(bookingPostData.bookingDay);

    if (options.requireMail && bookingPostData.email == null) {
      throw new UnprocessableEntity('The E-Mail field may not be empty.');
    }

    const bookingValidation = getBookingInterval(
      bookingDay,
      weekday.data.name,
      timeslot.data,
      settings,
      options.ignoreDeadlines,
      options.ignoreMaxWeekDistance
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

          const newDbData = {
            ...bookingPostData,
            startDate: bookingValidation.result.start.toJSDate(),
            endDate: bookingValidation.result.end.toJSDate(),
            timeslotId: timeslot.id,
          };

          if (
            bookings.length < timeslot.data.capacity ||
            mode.kind === 'modify' ||
            options.allowToExceedCapacity
          ) {
            let booking: Booking;
            switch (mode.kind) {
              case 'create':
                booking = await Booking.create<Booking>(newDbData);
                break;

              case 'modify':
                booking = await mode.toModify.update(newDbData);
                break;

              default:
                assertNever();
            }

            if (booking.email != null) {
              await this.sendBookingLookupMail(
                bookingPostData.lookupUrl,
                booking,
                timeslot
              );
            }

            if (options.autoVerify) {
              await booking.update({
                isVerified: true,
              });
            }

            return this.toInterface(booking);
          } else {
            throw new Conflict(
              'The timeslot has reached max. capacity. No more bookings can be created.'
            );
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
    bookingPostData: BookingPostInterface,
    options: BookingModificationOptions
  ): Promise<BookingDBInterface> {
    return this.createOrModifyBooking(
      { kind: 'create', timeslot },
      bookingPostData,
      options
    );
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
    data: BookingPostInterface,
    options: BookingModificationOptions
  ): Promise<BookingDBInterface> {
    const maybeBooking = await this.findByIdInternal(id);

    if (maybeBooking != null) {
      return this.createOrModifyBooking(
        { kind: 'modify', toModify: maybeBooking },
        data,
        options
      );
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

    const weekday = await timeslot.getWeekday();
    const resourceName = weekday.resourceName;

    const startDate = DateTime.fromJSDate(booking.startDate).setLocale('de-DE');
    const endDate = DateTime.fromJSDate(booking.endDate).setLocale('de-DE');

    const intro = i18nextInstance.t('booking-repository-mail-booking-intro');
    const timeString = `"${resourceName}"
              am
              ${startDate.toLocaleString({ ...DateTime.DATE_MED_WITH_WEEKDAY })}
              von
              ${startDate.toLocaleString({ ...DateTime.TIME_24_SIMPLE })}
              bis
              ${endDate.toLocaleString({ ...DateTime.TIME_24_SIMPLE })}
    `;

    const lookupLink = `${lookupUrl}?lookupToken=${lookupToken}`;

    const settings = await this.settingsRepository.get();

    await this.mailTransporter.send(
      booking.email,
      `Ihre Buchung - ${booking.name}`,
      `
          ${intro}
          
              ${timeString}
          
          ${
            settings.data.requireMailConfirmation
              ? `Klicken Sie auf diesen Link um ihre Buchung zu bestätigen:
          
          ${lookupLink}
        
            IHRE BUCHUNG VERFÄLLT AUTOMATISCH NACH
            ${humanizeDuration(VerificationTimeout.toMillis(), {
              language: 'de',
            }).toUpperCase()}
            WENN SIE NICHT BESTÄTIGT WIRD.
            
          Sie können den Link auch verwenden um alle Buchungen auf diese E-Mail Adresse einzusehen oder Buchungen zu löschen
          `
              : `Sie können Ihre Buchungen unter diesem Link einsehen und ggf. löschen:
          
          ${lookupLink}
          `
          }
      `,
      `
        <p>
          ${intro}
          <p>
            <i style="margin-left: 2em">
                ${timeString}
            </i>
          </p>
        </p>
        ${
          settings.data.requireMailConfirmation
            ? `<p>
          Klicken Sie auf diesen Link um ihre Buchung zu bestätigen:
        </p>
        <a href="${lookupLink}">Bestätigen und Buchungen einsehen</a>
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
          Sie können den Link auch verwenden um alle Buchungen auf diese E-Mail Adresse einzusehen oder Buchungen zu löschen.
        </p>
          `
            : `<p>Sie können Ihre Buchungen unter diesem Link einsehen und ggf. löschen:</p>
        <a href="${lookupLink}">Buchungen einsehen</a>
        `
        }
      `
    ); // FIXME: Formatting
  }
}

type BookingModificationMode =
  | { kind: 'create'; timeslot: TimeslotDBInterface }
  | { kind: 'modify'; toModify: Booking };

export interface BookingModificationOptions {
  ignoreDeadlines: boolean;
  ignoreMaxWeekDistance: boolean;
  requireMail: boolean;
  autoVerify: boolean;
  allowToExceedCapacity: boolean;
}
