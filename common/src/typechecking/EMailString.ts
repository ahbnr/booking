import * as t from 'io-ts';
import validator from 'validator';

export interface EMailStringBrand {
  readonly EMailString: unique symbol;
}

export const EMailString = t.brand(
  t.string, // refining string
  (maybeMail): maybeMail is t.Branded<string, EMailStringBrand> =>
    validator.isEmail(maybeMail), // refinement
  'EMailString' // the name must match the readonly field in the brand
);

export type EMailString = t.TypeOf<typeof EMailString>;
