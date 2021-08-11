import { DateTime } from 'luxon';
import { WeekdayName } from 'common';
import SettingsDBInterface from '../repositories/model_interfaces/SettingsDBInterface';
import computeEarliestBookingDate from './computeEarliestBookingDate';
import { weekdayToISOInt } from 'common/dist/typechecking/api/Weekday';
import {
  Validation,
  ValidationError,
  ValidationSuccess,
} from '../types/Validation';

export default function isValidBookingDate(
  date: DateTime,
  weekday: WeekdayName,
  settings: SettingsDBInterface,
  ignoreDeadlines: boolean
): Validation {
  if (date.weekday !== weekdayToISOInt(weekday)) {
    return ValidationError(`The booking date is not a ${weekday}`);
  }

  if (date < DateTime.now()) {
    return ValidationError('The booking date is in the past');
  }

  if (ignoreDeadlines) {
    return ValidationSuccess();
  }

  const earliestBookingDate = computeEarliestBookingDate(
    weekday,
    settings.data.bookingDeadlineMillis
  );

  if (date < earliestBookingDate) {
    return ValidationError(
      `The booking date is too early. The earliest date where you can create a booking is ${earliestBookingDate.toISO()}`
    );
  }

  return ValidationSuccess();
}
