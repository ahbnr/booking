import { DateTime, Interval } from 'luxon';
import {
  setTimeslotEndDate,
  setTimeslotStartDate,
  TimeslotData,
  WeekdayName,
} from 'common';
import SettingsDBInterface from '../repositories/model_interfaces/SettingsDBInterface';
import computeEarliestBookingDate from './computeEarliestBookingDate';
import { weekdayToISOInt } from 'common/dist/typechecking/api/Weekday';
import {
  Validation,
  ValidationError,
  ValidationSuccess,
} from '../types/Validation';

export default function getBookingInterval(
  dayDate: DateTime,
  weekday: WeekdayName,
  timeslot: TimeslotData,
  settings: SettingsDBInterface,
  ignoreDeadlines: boolean
): Validation<Interval, string> {
  if (dayDate.weekday !== weekdayToISOInt(weekday)) {
    return ValidationError(`The booking date is not a ${weekday}`);
  }

  const start = setTimeslotStartDate(dayDate, timeslot);
  const end = setTimeslotEndDate(dayDate, timeslot);

  const bookingInterval = Interval.fromDateTimes(start, end);
  const now = DateTime.now();

  if (bookingInterval.start < now) {
    return ValidationError(
      `The booking date is in the past. Booking Date: ${bookingInterval.start}. Current date: ${now}`
    );
  }

  if (ignoreDeadlines) {
    return ValidationSuccess(bookingInterval);
  }

  const earliestBookingDate = computeEarliestBookingDate(
    weekday,
    settings.data.bookingDeadlineMillis
  );

  if (dayDate < earliestBookingDate) {
    return ValidationError(
      `The booking date is too early. The earliest date where you can create a booking is ${earliestBookingDate.toISO()}`
    );
  }

  return ValidationSuccess(bookingInterval);
}
