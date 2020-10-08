import { Errors, Type } from 'io-ts';
import { getOrElse } from 'fp-ts/Either';
import * as t from 'io-ts';
import validator from 'validator';

/**
 * Ensures a object has a given property.
 *
 * Based on https://fettblog.eu/typescript-hasownproperty/
 */
export function hasProperty<
  // eslint-disable-next-line @typescript-eslint/ban-types
  X extends object,
  Y extends PropertyKey
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function validateJson<A, O, I>(type: Type<A, O, I>, data: I): A {
  const decoded = type.decode(data);

  return getOrElse<Errors, A>((error) => {
    throw new DataValidationError(
      `Data did not conform to expected schema: ${type.name}.`,
      error
    );
  })(decoded);
}

interface EMailBrand {
  readonly EMail: unique symbol;
}

export const EMail = t.brand(
  t.string, // refining string
  (maybeMail): maybeMail is t.Branded<string, EMailBrand> =>
    validator.isEmail(maybeMail), // refinement
  'EMail' // the name must match the readonly field in the brand
);

export type EMail = t.TypeOf<typeof EMail>;

interface NonEmptyStringBrand {
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

export class DataValidationError {
  public readonly message: string;
  public readonly baseError?: any;

  constructor(message: string, baseError?: any) {
    this.message = message;
    this.baseError = baseError;
  }
}
