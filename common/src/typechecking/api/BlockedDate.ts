import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';
import { ISO8601 } from '../ISO8601';

export const BlockedDateGetInterface = t.type({
  date: ISO8601,
  note: t.union([t.undefined, NonEmptyString]),
});

export type BlockedDateGetInterface = t.TypeOf<typeof BlockedDateGetInterface>;

export const BlockedDatePostInterface = t.type({
  note: t.union([t.undefined, NonEmptyString]),
});
export type BlockedDatePostInterface = t.TypeOf<
  typeof BlockedDatePostInterface
>;
