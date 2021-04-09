import * as t from 'io-ts';
import { NonEmptyString } from '../../NonEmptyString';

export const AuthResponseData = t.type({
  authToken: NonEmptyString,
});

export type AuthResponseData = t.TypeOf<typeof AuthResponseData>;
