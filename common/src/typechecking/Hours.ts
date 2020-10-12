import * as t from 'io-ts';

export interface HoursBrand {
  readonly Hours: unique symbol;
}

export const Hours = t.brand(
  t.number,
  (value): value is t.Branded<number, HoursBrand> =>
    Number.isInteger(value) && value >= 0 && value < 24,
  'Hours' // the name must match the readonly field in the brand
);

export type Hours = t.TypeOf<typeof Hours>;
