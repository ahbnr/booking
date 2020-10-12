import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';
import { EMailString } from '../EMailString';

export const BookingData = t.type({
  name: NonEmptyString,
  email: EMailString,
});

export type BookingData = t.TypeOf<typeof BookingData>;

export const BookingGetInterface = t.type({
  ...BookingData.props,
  id: t.number,
  timeslotId: t.number,
});

export type BookingGetInterface = t.TypeOf<typeof BookingGetInterface>;

export const BookingPostInterface = t.type({
  ...BookingData.props,
  lookupUrl: t.string,
});

export type BookingPostInterface = t.TypeOf<typeof BookingPostInterface>;
