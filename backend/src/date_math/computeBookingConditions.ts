import SettingsRepository from '../repositories/SettingsRepository';
import { noRefinementChecks, WeekdayName } from 'common';
import { BookingConditionsGetInterface } from 'common/dist/typechecking/api/BookingConditions';
import { ISO8601 } from 'common/dist/typechecking/ISO8601';
import computeEarliestBookingDate from './computeEarliestBookingDate';

export default async function computeBookingConditions(
  weekday: WeekdayName,
  settingsRepository: SettingsRepository
): Promise<BookingConditionsGetInterface> {
  const settings = await settingsRepository.get();

  const earliestBookingDate = computeEarliestBookingDate(
    weekday,
    settings.data.enableBookingDeadline,
    settings.data.bookingDeadlineMillis
  );

  return {
    earliestBookingDate: noRefinementChecks<ISO8601>(
      earliestBookingDate.toISO()
    ),
    allowedWeeksInAdvance: 1,
  };
}
