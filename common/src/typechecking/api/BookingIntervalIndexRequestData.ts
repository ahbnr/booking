import * as t from 'io-ts';
import { ISO8601 } from '../ISO8601';

export const BookingIntervalIndexRequestData = t.type({
  start: ISO8601,
  end: ISO8601,
});

export type BookingIntervalIndexRequestData = t.TypeOf<
  typeof BookingIntervalIndexRequestData
>;
