import { Booking } from './Booking';
import { Weekday } from './Weekday';

export interface TimeslotData {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  capacity: number;
}

export interface Timeslot {
  id: number;

  data: TimeslotData;

  weekday: Weekday;
  bookings: Booking[];
}

export function fromData(
  id: number,
  weekday: Weekday,
  bookings: Booking[],
  data: TimeslotData
): Timeslot {
  return {
    id: id,
    weekday: weekday,
    bookings: bookings,
    data: data,
  };
}

export function compare(left: Timeslot, right: Timeslot): number {
  if (left.data.startHours < right.data.startHours) {
    return -1;
  } else if (left.data.startHours > right.data.startHours) {
    return 1;
  } else {
    return left.data.startMinutes - right.data.startMinutes;
  }
}
