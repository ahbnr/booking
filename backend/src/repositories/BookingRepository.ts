import { Booking } from '../models/booking.model';
import { Timeslot } from '../models/timeslot.model';
import { ISO8601 } from 'common/dist/typechecking/ISO8601';
import { DestroyOptions, Op, WhereOptions } from 'sequelize';
import { Weekday } from '../models/weekday.model';
import { Resource } from '../models/resource.model';
import BookingDBInterface from './model_interfaces/BookingDBInterface';
import { boundClass } from 'autobind-decorator';
import {
  BookingPostInterface,
  EMailString,
  setTimeslotEndDate,
  setTimeslotStartDate,
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
import assertNever from '../utils/assertNever';
import { delay, inject, singleton } from 'tsyringe';

@singleton()
@boundClass
export default class BookingRepository {
  constructor(
    @inject(delay(() => ResourceRepository))
    private readonly resourceRepository: ResourceRepository,

    @inject(delay(() => TimeslotRepository))
    private readonly timeslotRepository: TimeslotRepository,

    @inject(delay(() => SettingsRepository))
    private readonly settingsRepository: SettingsRepository
  ) {}

  public toInterface(booking: Booking): BookingDBInterface {
    return new BookingDBInterface(booking, this);
  }

  public async create(
    timeslot: TimeslotDBInterface,
    bookingPostData: BookingPostInterface,
    ignoreDeadlines: boolean,
    ignoreMaxWeekDistance: boolean
  ): Promise<BookingDBInterface> {
    const weekday = await timeslot.getWeekday();
    const settings = await this.settingsRepository.get();
    const bookingDay = DateTime.fromISO(bookingPostData.bookingDay);

    const bookingValidation = getBookingInterval(
      bookingDay,
      weekday.data.name,
      timeslot.data,
      settings,
      ignoreDeadlines,
      ignoreMaxWeekDistance
    );

    switch (bookingValidation.kind) {
      case 'error':
        throw new UnprocessableEntity(
          `Invalid booking date: ${bookingValidation.error}`
        );
      case 'success': {
        const bookings = await timeslot.getBookings(bookingDay);

        if (bookings.length < timeslot.data.capacity) {
          const booking = await Booking.create<Booking>({
            ...bookingPostData,
            startDate: bookingValidation.result.start.toJSDate(),
            endDate: bookingValidation.result.end.toJSDate(),
            timeslotId: timeslot.id,
          });

          return this.toInterface(booking);
        } else {
          throw new Conflict(
            'The timeslot has reached max. capacity. No more bookings can be created.'
          );
        }
      }
      default:
        return assertNever();
    }
  }

  public async findAll(
    whereOptions?: WhereOptions
  ): Promise<BookingDBInterface[]> {
    const bookings = await Booking.findAll({
      include: [Timeslot],
      where: whereOptions,
    });

    const clearedBookings = await BookingRepository.clearPastBookings(bookings);

    return clearedBookings.map(this.toInterface);
  }

  public async findInInterval(
    start: ISO8601,
    end: ISO8601
  ): Promise<BookingDBInterface[]> {
    const foundBookings = await Booking.findAll<Booking>({
      where: {
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [start, end],
            },
          },
          {
            endDate: {
              [Op.between]: [start, end],
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

    const clearedBookings = await BookingRepository.clearPastBookings(
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

    const clearedBookings = await BookingRepository.clearPastBookings(bookings);

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
    data: BookingPostInterface
  ): Promise<BookingDBInterface> {
    const maybeBooking = await this.findByIdInternal(id);

    if (maybeBooking != null) {
      const updatedBooking = await maybeBooking.update(data);

      return this.toInterface(updatedBooking);
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

  public async getTimeslotOfBooking(
    booking: Booking
  ): Promise<TimeslotDBInterface> {
    const timeslot = await booking.lazyTimeslot;

    return this.timeslotRepository.toInterface(timeslot);
  }

  public async getResourceOfBooking(
    booking: Booking
  ): Promise<ResourceDBInterface> {
    const rawResource =
      booking.timeslot?.weekday?.resource ||
      throwExpr<Resource>(
        new Error(
          'Can not access related db entities, even though they should have already been loaded. This should never happen and is a programming error.'
        )
      );

    // FIXME: Transfer creation of DB interface to resource repository
    return new ResourceDBInterface(rawResource, this.resourceRepository);
  }

  private static async clearPastBookings(
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
}
