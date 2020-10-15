import * as t from 'io-ts';
import validator from 'validator';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISO8601Brand {
  readonly ISO8601: unique symbol;
}

export const ISO8601 = t.brand(
  t.string,
  (value): value is t.Branded<string, ISO8601Brand> =>
    validator.isISO8601(value),
  'ISO8601' // the name must match the readonly field in the brand
);

export type ISO8601 = t.TypeOf<typeof ISO8601>;
