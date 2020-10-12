import * as t from 'io-ts';
import { EMailString } from '../EMailString';

export const InviteForSignupData = t.type({
  email: EMailString,
  targetUrl: t.string,
});

export type InviteForSignupData = t.TypeOf<typeof InviteForSignupData>;
