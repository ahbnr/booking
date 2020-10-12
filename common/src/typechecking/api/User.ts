import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';
import { EMailString } from '../EMailString';

export const UserData = t.type({
  name: NonEmptyString,
  email: t.union([EMailString, t.undefined, t.null]),
  password: NonEmptyString,
});

export type UserData = t.TypeOf<typeof UserData>;

export const UserGetInterface = UserData;
export type UserGetInterface = t.TypeOf<typeof UserGetInterface>;

export const UserPostInterface = UserData;
export type UserPostInterface = t.TypeOf<typeof UserPostInterface>;
