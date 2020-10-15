import * as t from 'io-ts';
import { DateTime, Duration } from 'luxon';

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
  resourceName: t.string,
});

export type WeekdayGetInterface = t.TypeOf<typeof WeekdayGetInterface>;

export const WeekdayPostInterface = WeekdayData;
export type WeekdayPostInterface = WeekdayData;

export function weekdayToISOInt(weekday: WeekdayName): number {
  switch (weekday) {
    case 'monday':
      return 1;
    case 'tuesday':
      return 2;
    case 'wednesday':
      return 3;
    case 'thursday':
      return 4;
    case 'friday':
      return 5;
    case 'saturday':
      return 6;
    case 'sunday':
      return 7;
  }
}

export function getWeekdayDate(weekdayName: WeekdayName): DateTime {
  const targetWeekdayInt = weekdayToISOInt(weekdayName);
  const now = DateTime.local();
  const today = now.weekday;

  let result: DateTime;
  // We did not yet pass the target weekday in the current week...
  if (today <= targetWeekdayInt) {
    // hence, we can just use the target day from the current week
    result = now.set({ weekday: targetWeekdayInt });
  } else {
    // otherwise we need to get the target day from the next week
    result = now
      .plus(Duration.fromObject({ weeks: 1 }))
      .set({ weekday: targetWeekdayInt });
  }

  return result.startOf('day');
}
