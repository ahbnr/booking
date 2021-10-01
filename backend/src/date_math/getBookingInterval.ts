import { DateTime, Duration, Interval } from 'luxon';
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
import BlockedDateRepository from '../repositories/BlockedDateRepository';

export default async function getBookingInterval(
  dayDate: DateTime,
  weekday: WeekdayName,
  timeslot: TimeslotData,
  settings: SettingsDBInterface,
  blockedDateRepository: BlockedDateRepository,
  ignoreDeadlines: boolean,
  ignoreMaxWeekDistance: boolean,
  ignoreBlockedDates: boolean
): Promise<Validation<Interval, string>> {
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

  const earliestBookingDate = computeEarliestBookingDate(
    weekday,
    settings.data.bookingDeadlineMillis
  );

  if (!ignoreMaxWeekDistance && settings.data.maxBookingWeekDistance >= 0) {
    const maxBookingDate = earliestBookingDate.plus(
      Duration.fromObject({ weeks: settings.data.maxBookingWeekDistance })
    );

    if (dayDate > maxBookingDate) {
      return ValidationError(
        `The booking day is too late. Booking day: ${dayDate.toISODate()}. Maximum allowed day: ${maxBookingDate.toISODate()}`
      );
    }
  }

  if (!ignoreDeadlines && dayDate < earliestBookingDate) {
    return ValidationError(
      `The booking date is too early. The earliest date where you can create a booking is ${earliestBookingDate.toISO()}`
    );
  }

  if (!ignoreBlockedDates) {
    const blockedDates = await blockedDateRepository.getInRange(
      bookingInterval.start,
      bookingInterval.end
    );

    if (blockedDates.length > 0) {
      return ValidationError(
        'The booking date is blocked. No bookings can be created on this day, unless you are an admin.'
      );
    }
  }

  return ValidationSuccess(bookingInterval);
}
