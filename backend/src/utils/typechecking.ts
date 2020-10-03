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
