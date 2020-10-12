import * as t from 'io-ts';

export const WeekdayName = t.union([
  t.literal('monday'),
  t.literal('tuesday'),
  t.literal('wednesday'),
  t.literal('thursday'),
  t.literal('friday'),
  t.literal('saturday'),
  t.literal('sunday'),
]);

export type WeekdayName = t.TypeOf<typeof WeekdayName>;

export const WeekdayNameValues = WeekdayName.types.map((type) => type.value);

export const WeekdayData = t.type({
  name: WeekdayName,
});

export type WeekdayData = t.TypeOf<typeof WeekdayData>;

export const WeekdayGetInterface = t.type({
  ...WeekdayData.props,
  id: t.number,
});

export type WeekdayGetInterface = t.TypeOf<typeof WeekdayGetInterface>;

export const WeekdayPostInterface = WeekdayData;
export type WeekdayPostInterface = WeekdayData;
