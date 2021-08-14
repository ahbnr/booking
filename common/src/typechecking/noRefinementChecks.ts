/* eslint-disable unused-imports/no-unused-imports */
/**
 * Forcefully removes refinements recursively from the type of a value.
 */
import { Branded } from 'io-ts';

export function noRefinementChecks<T>(inputType: Unbranded<T>): T {
  return (inputType as unknown) as T;
}

/**
 * Conditional type which removes Branded types recursively
 */
export type Unbranded<T> =
  // If the given type is a Branded type...
  T extends Branded<infer C, infer _B>
    ? C // ... remove the branding. Don't recurse further (not supported yet, we will need TypeScript 4.1 for that)
    : T extends Array<infer U>[] // .. otherwise, if the given type is an array type...
    ? Unbranded<U>[] // ... then remove brandings from its value type...
    : T extends { [K in keyof T]: T[K] } // ...otherwise, if the given type is a mapped type...
    ? { [K in keyof T]: Unbranded<T[K]> } // ... then remove brandings from its element types...
    : T; // otherwise, stop recursion / do nothing.
