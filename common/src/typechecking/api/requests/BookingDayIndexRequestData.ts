import * as t from 'io-ts';
import { ISO8601 } from '../../ISO8601';

export const BookingDayIndexRequestData = t.type({
  date: ISO8601,
});

export type BookingDayIndexRequestData = t.TypeOf<
  typeof BookingDayIndexRequestData
>;
