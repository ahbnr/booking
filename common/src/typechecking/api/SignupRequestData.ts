import * as t from 'io-ts';
import { UserPostInterface } from './User';

export const SignupRequestData = t.type({
  signupToken: t.string,
  userData: UserPostInterface,
});

export type SignupRequestData = t.TypeOf<typeof SignupRequestData>;
