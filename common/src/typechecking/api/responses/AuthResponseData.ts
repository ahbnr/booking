import * as t from 'io-ts';
import { NonEmptyString } from '../../NonEmptyString';
import { ISO8601 } from '../../ISO8601';

export const AuthResponseData = t.type({
  authToken: NonEmptyString,
  expiresAt: ISO8601,
});

export type AuthResponseData = t.TypeOf<typeof AuthResponseData>;
