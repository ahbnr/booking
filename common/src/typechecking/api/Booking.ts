import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';
import { EMailString } from '../EMailString';
import { ISO8601 } from '../ISO8601';
import { ResourceGetInterface } from './Resource';

export const BookingData = t.type({
  name: NonEmptyString,
  email: EMailString,
});

export type BookingData = t.TypeOf<typeof BookingData>;

export const BookingGetInterface = t.type({
  id: t.number,
  ...BookingData.props,
  startDate: ISO8601,
  endDate: ISO8601,
  timeslotId: t.number,
});

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

export const BookingWithContextGetInterface = t.type({
  ...BookingGetInterface.props,
  resource: ResourceGetInterface,
});

export type BookingWithContextGetInterface = t.TypeOf<
  typeof BookingWithContextGetInterface
>;

export const BookingPostInterface = t.type({
  ...BookingData.props,
  bookingDay: ISO8601,
  lookupUrl: t.string,
});

export type BookingPostInterface = t.TypeOf<typeof BookingPostInterface>;
