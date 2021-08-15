import { getNextWeekdayDate, WeekdayName } from 'common';
import { Client } from '../Client';
import { DateTime } from 'luxon';
import sortBy from 'lodash/fp/sortBy';

export async function getValidBookingDays(
  weekdays: { name: WeekdayName; id: number }[],
  isAuthenticated: boolean,
  client: Client
): Promise<WeekdayBookingConstraint[]> {
  const bookableWeekdays = await Promise.all(
    weekdays.map(async (weekday) => {
      let earliestDate: DateTime;
      if (isAuthenticated) {
        earliestDate = getNextWeekdayDate(weekday.name);
      } else {
        const bookingConditions = await client.getWeekdayBookingConditions(
          weekday.id
        );

        earliestDate = DateTime.fromISO(bookingConditions.earliestBookingDate);
      }

      return {
        weekdayName: weekday.name,
        weekdayId: weekday.id,
        earliestDate,
      };
    })
  );

  return sortBy(
    (bookableWeekday) => bookableWeekday.earliestDate,
    bookableWeekdays
  );
}

export interface WeekdayBookingConstraint {
  weekdayName: WeekdayName;
  weekdayId: number;
  earliestDate: DateTime;
}
