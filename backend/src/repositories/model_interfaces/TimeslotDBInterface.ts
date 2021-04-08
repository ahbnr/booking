import {
  noRefinementChecks,
  TimeslotData,
  TimeslotGetInterface,
} from 'common/dist';
import { Timeslot } from '../../models/timeslot.model';
import BookingDBInterface from './BookingDBInterface';
import TimeslotRepository from '../TimeslotRepository';
import WeekdayDBInterface from './WeekdayDBInterface';
import { LazyGetter } from 'lazy-get-decorator';

export default class TimeslotDBInterface {
  private readonly timeslot: Timeslot;
  private readonly repository: TimeslotRepository;

  constructor(timeslot: Timeslot, repository: TimeslotRepository) {
    this.timeslot = timeslot;
    this.repository = repository;
  }

  public async getBookings(): Promise<BookingDBInterface[]> {
    return this.repository.getAssociatedBookings(this.timeslot);
  }

  public async getWeekday(): Promise<WeekdayDBInterface> {
    return this.repository.getAssociatedWeekday(this.timeslot);
  }

  public get id(): number {
    return this.timeslot.id;
  }

  @LazyGetter()
  public get data(): TimeslotData {
    return noRefinementChecks<TimeslotData>({
      startHours: this.timeslot.startHours,
      startMinutes: this.timeslot.startMinutes,
      endHours: this.timeslot.endHours,
      endMinutes: this.timeslot.endMinutes,
      capacity: this.timeslot.capacity,
    });
  }

  public async toGetInterface(): Promise<TimeslotGetInterface> {
    const bookings = await this.timeslot.lazyBookings;

    return noRefinementChecks<TimeslotGetInterface>({
      ...this.data,

      id: this.timeslot.id,

      weekdayId: this.timeslot.weekdayId,
      bookingIds: bookings.map((booking) => booking.id),
    });
  }
}
