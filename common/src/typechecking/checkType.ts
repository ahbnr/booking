// eslint-disable-next-line unused-imports/no-unused-imports
import { Errors, Type } from 'io-ts';
import { getOrElse } from 'fp-ts/Either';
import { DataValidationError } from './DataValidationError';

export function checkType<A, O, I>(data: I, type: Type<A, O, I>): A {
  const decoded = type.decode(data);

  return getOrElse<Errors, A>((error) => {
    throw new DataValidationError(
      `Data did not conform to expected schema.\n\nExpected: ${
        type.name
      }.\n\nActual: ${JSON.stringify(data)}`,
      error
    );
  })(decoded);
}
