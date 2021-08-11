import * as t from 'io-ts';
import { ISO8601 } from '../ISO8601';

export const BookingConditionsGetInterface = t.type({
  earliestBookingDate: ISO8601,
  allowedWeeksInAdvance: t.number,
});

export type BookingConditionsGetInterface = t.TypeOf<
  typeof BookingConditionsGetInterface
>;
