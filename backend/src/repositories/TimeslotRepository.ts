import { Timeslot } from '../models/timeslot.model';
import { TimeslotData, TimeslotPostInterface } from 'common/dist';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import { NoElementToDestroy, NoElementToUpdate } from './errors';
import TimeslotDBInterface from './model_interfaces/TimeslotDBInterface';
import { boundClass } from 'autobind-decorator';
import BookingDBInterface from './model_interfaces/BookingDBInterface';
import BookingRepository from './BookingRepository';
import WeekdayRepository from './WeekdayRepository';
import WeekdayDBInterface from './model_interfaces/WeekdayDBInterface';

@boundClass
export default class TimeslotRepository {
  private bookingRepository!: BookingRepository;
  private weekdayRepository!: WeekdayRepository;

  init(
    bookingRepository: BookingRepository,
    weekdayRepository: WeekdayRepository
  ) {
    this.bookingRepository = bookingRepository;
    this.weekdayRepository = weekdayRepository;
  }

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

  public async update(timeslotId: number, timeslotData: TimeslotPostInterface) {
    const update: UpdateOptions = {
      where: { id: timeslotId },
      limit: 1,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [numAffectedRows, _] = await Timeslot.update(timeslotData, update);

    if (numAffectedRows < 1) {
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
    timeslot: Timeslot
  ): Promise<BookingDBInterface[]> {
    const bookings = await timeslot.lazyBookings;

    return bookings.map(this.bookingRepository.toInterface);
  }

  public async getAssociatedWeekday(
    timeslot: Timeslot
  ): Promise<WeekdayDBInterface> {
    const weekday = await timeslot.lazyWeekday;

    return this.weekdayRepository.toInterface(weekday);
  }
}
