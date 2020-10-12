import * as t from 'io-ts';

export const AuthRequestData = t.type({
  username: t.string,
  password: t.string,
});

export type AuthRequestData = t.TypeOf<typeof AuthRequestData>;
