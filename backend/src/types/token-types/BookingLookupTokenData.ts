import * as t from 'io-ts';
import { EMailString } from 'common/dist';

export const BookingLookupTokenData = t.type({
  type: t.literal('BookingLookupToken'),
  email: EMailString,
});

export type BookingLookupTokenData = t.TypeOf<typeof BookingLookupTokenData>;
