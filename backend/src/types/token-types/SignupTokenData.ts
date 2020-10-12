import * as t from 'io-ts';
import { EMailString } from 'common/dist';

export const SignupTokenData = t.type({
  type: t.literal('SignupToken'),
  email: EMailString,
});

export type SignupTokenData = t.TypeOf<typeof SignupTokenData>;
