import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';

export const IsSignupTokenOkRequestData = t.type({
  signupToken: NonEmptyString,
});

export type IsSignupTokenOkRequestData = t.TypeOf<
  typeof IsSignupTokenOkRequestData
>;
