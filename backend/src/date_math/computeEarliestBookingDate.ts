import { getNextWeekdayDate, WeekdayName } from 'common';
import { DateTime, Duration } from 'luxon';

/**
 * Computes the earliest *day* om which a booking can be made
 */
export default function computeEarliestBookingDate(
  weekday: WeekdayName,
  enableBookingDeadline: boolean,
  bookingDeadlineMillis: number
): DateTime {
  // Determine, if you can still book for the next date of the weekday
  const nextWeekdayDate = getNextWeekdayDate(weekday);
  const deadlineDuration = Duration.fromMillis(bookingDeadlineMillis);
  const now = DateTime.now();

  let earliestBookingDate = nextWeekdayDate;
  if (enableBookingDeadline) {
    // if we have already passed the deadline...
    if (nextWeekdayDate.minus(deadlineDuration) < now) {
      // ...then we have to book next week
      earliestBookingDate = nextWeekdayDate.plus(
        Duration.fromObject({ weeks: 1 })
      );
    }
  }

  return earliestBookingDate;
}
