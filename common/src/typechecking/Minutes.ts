import * as t from 'io-ts';

export interface MinutesBrand {
  readonly Minutes: unique symbol;
}

export const Minutes = t.brand(
  t.number,
  (value): value is t.Branded<number, MinutesBrand> =>
    Number.isInteger(value) && value >= 0 && value < 60,
  'Minutes' // the name must match the readonly field in the brand
);

export type Minutes = t.TypeOf<typeof Minutes>;
