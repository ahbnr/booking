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

export default class BookingDBInterface {
  private readonly booking: Booking;
  private readonly bookingRepository: BookingRepository;

  constructor(booking: Booking, bookingRepository: BookingRepository) {
    this.booking = booking;
    this.bookingRepository = bookingRepository;
  }

  public get startDate(): Date {
    return this.booking.startDate;
  }
  public get endDate(): Date {
    return this.booking.endDate;
  }

  @LazyGetter()
  public get data(): BookingData {
    return noRefinementChecks<BookingData>({
      name: this.booking.name,
      email: this.booking.email,
    });
  }

  public async getTimeslot() {
    return this.bookingRepository.getTimeslotOfBooking(this.booking);
  }

  public async getResource(): Promise<ResourceDBInterface> {
    return this.bookingRepository.getResourceOfBooking(this.booking);
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
