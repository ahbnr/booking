import * as t from 'io-ts';
import { Hours } from '../Hours';
import { Minutes } from '../Minutes';
import { DateTime, Duration } from 'luxon';
import { getNextWeekdayDate, WeekdayName } from './Weekday';

export const TimeslotData = t.type({
  startHours: Hours,
  startMinutes: Minutes,
  endHours: Hours,
  endMinutes: Minutes,
  capacity: t.number,
});

export type TimeslotData = t.TypeOf<typeof TimeslotData>;

export const TimeslotGetInterface = t.type({
  ...TimeslotData.props,
  id: t.number,
  weekdayId: t.number,
  bookingIds: t.readonlyArray(t.number),
});

export type TimeslotGetInterface = t.TypeOf<typeof TimeslotGetInterface>;

export const TimeslotPostInterface = TimeslotData;
export type TimeslotPostInterface = TimeslotData;

export function compare(
  left: TimeslotGetInterface,
  right: TimeslotGetInterface
): number {
  if (left.startHours < right.startHours) {
    return -1;
  } else if (left.startHours > right.startHours) {
    return 1;
  } else {
    return left.startMinutes - right.startMinutes;
  }
}

function getCurrentTimeslotWeekdayDate(
  timeslot: TimeslotData,
  weekdayName: WeekdayName
): DateTime {
  const weekdayDate = getNextWeekdayDate(weekdayName);
  const now = DateTime.local();

  let result = weekdayDate;

  // is it today?
  if (now.weekday === weekdayDate.weekday) {
    // has the end of the timeslot already passed?
    if (
      now.hour >= timeslot.endHours ||
      (now.hour === timeslot.endHours && now.minute >= timeslot.endMinutes)
    ) {
      result = result.plus(Duration.fromObject({ weeks: 1 }));
    }
  }

  return result;
}

export function getCurrentTimeslotStartDate(
  timeslot: TimeslotData,
  weekdayName: WeekdayName
): DateTime {
  return getCurrentTimeslotWeekdayDate(timeslot, weekdayName).set({
    hour: timeslot.startHours,
    minute: timeslot.startMinutes,
  });
}

export function getCurrentTimeslotEndDate(
  timeslot: TimeslotData,
  weekdayName: WeekdayName
): DateTime {
  return getCurrentTimeslotWeekdayDate(timeslot, weekdayName).set({
    hour: timeslot.endHours,
    minute: timeslot.endMinutes,
  });
}
