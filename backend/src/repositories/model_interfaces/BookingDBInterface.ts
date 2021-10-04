import { Booking } from '../../models/booking.model';
import {
  BookingData,
  BookingGetInterface,
  noRefinementChecks,
} from 'common/dist';
import ResourceDBInterface from './ResourceDBInterface';
import BookingRepository from '../BookingRepository';
import { Duration } from 'luxon';
import { LazyGetter } from 'lazy-get-decorator';
import TimeslotDBInterface from './TimeslotDBInterface';

export default class BookingDBInterface {
  private readonly booking: Booking;
  private readonly bookingRepository: BookingRepository;

  constructor(booking: Booking, bookingRepository: BookingRepository) {
    this.booking = booking;
    this.bookingRepository = bookingRepository;
  }

  public get id(): number {
    return this.booking.id;
  }

  public get startDate(): Date {
    return this.booking.startDate;
  }
  public get endDate(): Date {
    return this.booking.endDate;
  }

  public get email(): string | undefined {
    return this.booking.email;
  }

  public get name(): string {
    return this.booking.name;
  }

  @LazyGetter()
  public get data(): BookingData {
    return noRefinementChecks<BookingData>({
      name: this.booking.name,
      email: this.booking.email,
    });
  }

  public getResource(): ResourceDBInterface {
    return this.bookingRepository.getResourceOfBooking(this.booking);
  }

  public async getTimeslot(): Promise<TimeslotDBInterface> {
    return await this.bookingRepository.getTimeslotFromBooking(this.booking);
  }

  public async markAsVerified() {
    this.booking.update({
      isVerified: true,
    });
  }

  public async destroy() {
    await this.booking.destroy();
  }

  public timeTillDue(): Duration {
    return this.booking.timeTillDue();
  }

  public toGetInterface(): BookingGetInterface {
    return noRefinementChecks<BookingGetInterface>({
      id: this.booking.id,
      ...this.data,
      startDate: this.booking.startDate.toISOString(),
      endDate: this.booking.endDate.toISOString(),
      timeslotId: this.booking.timeslotId,
    });
  }
}
