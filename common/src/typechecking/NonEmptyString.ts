import * as t from 'io-ts';

export interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol;
}

export const NonEmptyString = t.brand(
  t.string, // refining string
  (
    maybeNonEmptyString
  ): maybeNonEmptyString is t.Branded<string, NonEmptyStringBrand> =>
    maybeNonEmptyString !== '', // refinement
  'NonEmptyString' // the name must match the readonly field in the brand
);

export type NonEmptyString = t.TypeOf<typeof NonEmptyString>;
