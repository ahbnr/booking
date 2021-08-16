import * as t from 'io-ts';
import { NonEmptyString } from '../../NonEmptyString';

export const InviteForSignupSuccessData = t.type({
  kind: t.literal('success'),
  signupToken: NonEmptyString,
});
export type InviteForSignupSuccessData = t.TypeOf<
  typeof InviteForSignupSuccessData
>;

export const InviteForSignupFailureData = t.type({
  kind: t.literal('failure'),
});
export type InviteForSignupFailureData = t.TypeOf<
  typeof InviteForSignupFailureData
>;

export const InviteForSignupResponseData = t.union([
  InviteForSignupSuccessData,
  InviteForSignupFailureData,
]);
export type InviteForSignupResponseData = t.TypeOf<
  typeof InviteForSignupResponseData
>;
