import * as t from 'io-ts';

export const SignupSuccessData = t.type({
  kind: t.literal('success'),
});
export type SignupSuccessData = t.TypeOf<typeof SignupSuccessData>;

export const SignupFailureData = t.type({
  kind: t.literal('failure'),
  reason: t.union([t.literal('existing_name'), t.literal('existing_mail')]),
});
export type SignupFailureData = t.TypeOf<typeof SignupFailureData>;

export const SignupResponseData = t.union([
  SignupSuccessData,
  SignupFailureData,
]);
export type SignupResponseData = t.TypeOf<typeof SignupResponseData>;
