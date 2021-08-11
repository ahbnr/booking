import * as t from 'io-ts';
import { Hours } from '../Hours';
import { Minutes } from '../Minutes';
import { DateTime } from 'luxon';

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

export function setTimeslotStartDate(
  baseDate: DateTime,
  timeslot: TimeslotData
): DateTime {
  return baseDate.set({
    hour: timeslot.startHours,
    minute: timeslot.startMinutes,
  });
}

export function setTimeslotEndDate(
  baseDate: DateTime,
  timeslot: TimeslotData
): DateTime {
  return baseDate.set({
    hour: timeslot.endHours,
    minute: timeslot.endMinutes,
  });
}
