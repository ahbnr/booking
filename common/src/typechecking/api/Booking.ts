import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';
import { EMailString } from '../EMailString';
import { ISO8601 } from '../ISO8601';

export const BookingData = t.type({
  name: NonEmptyString,
  email: t.union([EMailString, t.undefined, t.null]),
});

export type BookingData = t.TypeOf<typeof BookingData>;

export const BookingWithContextData = t.type({
  id: t.number,
  ...BookingData.props,
  startDate: ISO8601,
  endDate: ISO8601,
  timeslotId: t.number,
});

export type BookingWithContextData = t.TypeOf<typeof BookingWithContextData>;

export const BookingGetInterface = BookingWithContextData;

export function compare(
  left: BookingGetInterface,
  right: BookingGetInterface
): number {
  return left.startDate < right.startDate
    ? -1
    : left.startDate === right.startDate
    ? 0
    : 1;
}

export type BookingGetInterface = t.TypeOf<typeof BookingGetInterface>;

export const BookingPostInterface = t.type({
  ...BookingData.props,
  bookingDay: ISO8601,
  lookupUrl: t.string,
});

export type BookingPostInterface = t.TypeOf<typeof BookingPostInterface>;
