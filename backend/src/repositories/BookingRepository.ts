import { Booking } from '../models/booking.model';
import { Timeslot } from '../models/timeslot.model';
import { ISO8601 } from 'common/dist/typechecking/ISO8601';
import { DestroyOptions, Op, UpdateOptions } from 'sequelize';
import { Weekday } from '../models/weekday.model';
import { Resource } from '../models/resource.model';
import BookingDBInterface from './model_interfaces/BookingDBInterface';
import { boundClass } from 'autobind-decorator';
import {
  BookingPostInterface,
  EMailString,
  getCurrentTimeslotEndDate,
  getCurrentTimeslotStartDate,
  ResourceGetInterface,
  throwExpr,
  TimeslotData,
} from 'common/dist';
import ResourceRepository from './ResourceRepository';
import ResourceDBInterface from './model_interfaces/ResourceDBInterface';
import TimeslotDBInterface from './model_interfaces/TimeslotDBInterface';
import { Conflict, UnprocessableEntity } from '../controllers/errors';
import TimeslotRepository from './TimeslotRepository';

@boundClass
export default class BookingRepository {
  // FIXME: Use dependency injection
  private resourceRepository!: ResourceRepository;
  private timeslotRepository!: TimeslotRepository;

  init(
    resourceRepository: ResourceRepository,
    timeslotRepository: TimeslotRepository
  ) {
    this.resourceRepository = resourceRepository;
    this.timeslotRepository = timeslotRepository;
  }

  public toInterface(booking: Booking): BookingDBInterface {
    return new BookingDBInterface(booking, this);
  }

  public async create(
    timeslot: TimeslotDBInterface,
    bookingPostData: BookingPostInterface
  ): Promise<BookingDBInterface> {
    const bookings = await timeslot.getBookings();

    if (bookings.length < timeslot.data.capacity) {
      const weekday = await timeslot.getWeekday();

      const startDate = getCurrentTimeslotStartDate(
        timeslot.data,
        weekday.data.name
      ).toJSDate();
      const endDate = getCurrentTimeslotEndDate(
        timeslot.data,
        weekday.data.name
      ).toJSDate();

      const booking = await Booking.create<Booking>({
        ...bookingPostData,
        startDate: startDate,
        endDate: endDate,
        timeslotId: timeslot.id,
      });

      return this.toInterface(booking);
    } else {
      throw new Conflict(
        'The timeslot has reached max. capacity. No more bookings can be created.'
      );
    }
  }

  public async findAll(): Promise<BookingDBInterface[]> {
    const bookings = await Booking.findAll({
      include: [Timeslot],
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
    let booking = await Booking.findByPk<Booking>(bookingId, {
      include: [Timeslot],
    });

    if (booking != null && (await booking.hasPassed())) {
      await booking.destroy();
      booking = null;
    }

    if (booking != null) {
      return this.toInterface(booking);
    }

    return null;
  }

  public async update(
    id: number,
    data: BookingPostInterface
  ): Promise<BookingDBInterface> {
    const update: UpdateOptions = {
      where: { id: id },
      limit: 1,
    };

    // noinspection JSUnusedLocalSymbols
    const [_, [booking]] = await Booking.update(data, update); // eslint-disable-line @typescript-eslint/no-unused-vars

    return this.toInterface(booking);
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
