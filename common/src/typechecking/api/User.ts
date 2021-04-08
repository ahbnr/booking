import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';
import { EMailString } from '../EMailString';

export const UserData = t.type({
  name: NonEmptyString,
  email: t.union([EMailString, t.undefined, t.null]),
  password: NonEmptyString,
});

export type UserData = t.TypeOf<typeof UserData>;

// FIXME: Make get interfaces strict, so we are not leaking any data
export const UserGetInterface = t.type({
  name: NonEmptyString,
  email: t.union([EMailString, t.undefined, t.null]),
});
export type UserGetInterface = t.TypeOf<typeof UserGetInterface>;

export const UserPostInterface = t.type({
  name: NonEmptyString,
  password: NonEmptyString,
});
export type UserPostInterface = t.TypeOf<typeof UserPostInterface>;
