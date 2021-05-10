import * as t from 'io-ts';
import { NonEmptyString } from 'common';

export const RefreshTokenData = t.type({
  type: t.literal('RefreshToken'),
  token: NonEmptyString,
  username: NonEmptyString,
});

export type RefreshTokenData = t.TypeOf<typeof RefreshTokenData>;
