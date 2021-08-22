import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';
import { BookingGetInterface, BookingWithContextData } from './Booking';

export const ResourceGroupedBookings = t.type({
  resourceName: NonEmptyString,
  bookings: t.readonlyArray(BookingWithContextData),
});

export type ResourceGroupedBookings = t.TypeOf<typeof ResourceGroupedBookings>;

export const ResourceGroupedBookingsGetInterface = t.type({
  resourceName: NonEmptyString,
  bookings: t.readonlyArray(BookingGetInterface),
});

export type ResourceGroupedBookingsGetInterface = t.TypeOf<
  typeof ResourceGroupedBookingsGetInterface
>;
