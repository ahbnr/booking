import { Timeslot } from '../models/timeslot.model';
import { TimeslotData, TimeslotPostInterface } from 'common/dist';
import { DestroyOptions, Op } from 'sequelize';
import { NoElementToDestroy, NoElementToUpdate } from './errors';
import TimeslotDBInterface from './model_interfaces/TimeslotDBInterface';
import { boundClass } from 'autobind-decorator';
import BookingDBInterface from './model_interfaces/BookingDBInterface';
import BookingRepository from './BookingRepository';
import WeekdayRepository from './WeekdayRepository';
import WeekdayDBInterface from './model_interfaces/WeekdayDBInterface';
import { DateTime } from 'luxon';
import { delay, inject, singleton } from 'tsyringe';

@singleton()
@boundClass
export default class TimeslotRepository {
  constructor(
    @inject(delay(() => BookingRepository))
    private readonly bookingRepository: BookingRepository,

    @inject(delay(() => WeekdayRepository))
    private readonly weekdayRepository: WeekdayRepository
  ) {}

  public toInterface(timeslot: Timeslot): TimeslotDBInterface {
    return new TimeslotDBInterface(timeslot, this);
  }

  public async findAll(): Promise<TimeslotDBInterface[]> {
    const timeslots = await Timeslot.findAll({});

    return timeslots.map(this.toInterface);
  }

  public async findById(
    timeslotId: number
  ): Promise<TimeslotDBInterface | null> {
    const timeslot = await Timeslot.findByPk<Timeslot>(timeslotId);

    if (timeslot != null) {
      return this.toInterface(timeslot);
    }

    return null;
  }

  public async create(
    weekdayId: number,
    timeslotData: TimeslotData
  ): Promise<TimeslotDBInterface> {
    const timeslot = await Timeslot.create<Timeslot>({
      weekdayId: weekdayId,
      ...timeslotData,
    });

    return this.toInterface(timeslot);
  }

  public async update(
    timeslotId: number,
    timeslotData: TimeslotPostInterface
  ): Promise<TimeslotDBInterface> {
    const maybeTimeslot = await Timeslot.findByPk(timeslotId);

    if (maybeTimeslot != null) {
      const updatedTimeslot = await maybeTimeslot.update(timeslotData);

      return this.toInterface(updatedTimeslot);
    } else {
      throw new NoElementToUpdate('timeslot');
    }
  }

  public async destroy(timeslotId: number) {
    const options: DestroyOptions = {
      where: { id: timeslotId },
      limit: 1,
    };

    const destroyedRows = await Timeslot.destroy(options);

    if (destroyedRows < 1) {
      throw new NoElementToDestroy('timeslot');
    }
  }

  public async getAssociatedBookings(
    timeslot: Timeslot,
    day: DateTime
  ): Promise<BookingDBInterface[]> {
    const startOfDay = day.startOf('day').toISO();
    const endOfDay = day.endOf('day').toISO();

    const bookings = await this.bookingRepository.findAll({
      [Op.and]: [
        {
          timeslotId: timeslot.id,
        },
        {
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [startOfDay, endOfDay],
              },
            },
            {
              endDate: {
                [Op.between]: [startOfDay, endOfDay],
              },
            },
          ],
        },
      ],
    });

    return bookings;
  }

  public async getAssociatedWeekday(
    timeslot: Timeslot
  ): Promise<WeekdayDBInterface> {
    const weekday = await timeslot.lazyWeekday;

    return this.weekdayRepository.toInterface(weekday);
  }
}
