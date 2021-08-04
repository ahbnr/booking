import * as t from 'io-ts';
import { DateTime, Duration, Interval } from 'luxon';

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

export function getNextWeekdayDate(weekdayName: WeekdayName): DateTime {
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

export function getWeekdayIntervals(weekdayName: WeekdayName): Interval[] {
  const targetWeekdayInt = weekdayToISOInt(weekdayName);
  const now = DateTime.local();
  const today = now.weekday;

  function toDayInterval(dt: DateTime): Interval {
    const dtDayStart = dt.startOf('day');
    const start = dtDayStart.set({ hour: 0, minute: 0 });
    const end = dtDayStart.set({ hour: 23, minute: 59 });

    return Interval.fromDateTimes(start, end);
  }

  let result: Interval[];
  if (today < targetWeekdayInt) {
    // We did not yet pass the target weekday in the current week...
    // hence, we can just use the target day from the current week
    const weekdayDate = now.set({ weekday: targetWeekdayInt });

    result = [toDayInterval(weekdayDate)];
  } else if (today === targetWeekdayInt) {
    // if the target day is the current day, the user either wants to see today or the same day of next week, so we add
    // both intervals
    const weekdayDateThisWeek = now.set({ weekday: targetWeekdayInt });

    const weekdayDateNextWeek = now
      .set({ weekday: targetWeekdayInt })
      .plus(Duration.fromObject({ weeks: 1 }));

    result = [
      toDayInterval(weekdayDateThisWeek),
      toDayInterval(weekdayDateNextWeek),
    ];
  } else {
    // otherwise we need to get the target day from the next week
    const weekdayDate = now
      .plus(Duration.fromObject({ weeks: 1 }))
      .set({ weekday: targetWeekdayInt });

    result = [toDayInterval(weekdayDate)];
  }

  return result;
}
