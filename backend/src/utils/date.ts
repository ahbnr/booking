import { WeekdayName } from '../models/weekday.model';
import moment from 'moment';
import { DateTime, Duration } from 'luxon';

function weekdayToInt(weekday: WeekdayName): number {
  switch (weekday) {
    case 'sunday':
      return 0;
    case 'monday':
      return 1;
    case 'tuesday':
      return 2;
    case 'wednesday':
      return 3;
    case 'thursday':
      return 4;
    case 'friday':
      return 5;
    case 'saturday':
      return 6;
  }
}

// FIXME: Replace moment with luxon
export function getPreviousWeekdayDate(weekday: WeekdayName): moment.Moment {
  const targetWeekdayInt = weekdayToInt(weekday);
  const today = moment().isoWeekday();

  let result: moment.Moment;
  // We did not yet pass the target weekday in the current week...
  if (today <= targetWeekdayInt) {
    // hence, we need to get the target day from the previous week
    result = moment().subtract(1, 'weeks').isoWeekday(targetWeekdayInt);
  } else {
    // otherwise we can just use the target day from the current week
    result = moment().isoWeekday(targetWeekdayInt);
  }

  return result.startOf('day');
}
export function getNextWeekdayDate(weekday: WeekdayName): DateTime {
  const targetWeekdayInt = weekdayToInt(weekday);
  const today = DateTime.local().weekday;

  let result: DateTime;
  // We did not yet pass the target weekday in the current week...
  if (today <= targetWeekdayInt) {
    // hence, we can just use the target day from the current week
    result = DateTime.local().set({ weekday: targetWeekdayInt });
  } else {
    // otherwise we need to get the target day from the next week
    result = DateTime.local()
      .plus(Duration.fromObject({ weeks: 1 }))
      .set({ weekday: targetWeekdayInt });
  }

  return result.startOf('day');
}
