import { getNextWeekdayDate, WeekdayGetInterface } from 'common';
import { Client } from '../Client';
import { DateTime } from 'luxon';
import _ from 'lodash';

export async function getValidBookingDays(
  weekdays: WeekdayGetInterface[],
  isAuthenticated: boolean,
  client: Client
): Promise<WeekdayWithBookingDay[]> {
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
        weekday,
        earliestDate,
      };
    })
  );

  return _.sortBy(
    bookableWeekdays,
    (bookableWeekday) => bookableWeekday.earliestDate
  );
}

export interface WeekdayWithBookingDay {
  weekday: WeekdayGetInterface;
  earliestDate: DateTime;
}
