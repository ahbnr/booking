import * as t from 'io-ts';
import { NonEmptyString } from 'common/dist';

export const AuthTokenData = t.type({
  type: t.literal('AuthTokenData'),
  username: NonEmptyString,
});

export type AuthTokenData = t.TypeOf<typeof AuthTokenData>;
