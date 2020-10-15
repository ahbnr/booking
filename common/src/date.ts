//import { DateTime, Duration } from 'luxon';
//import { TimeslotData } from './typechecking/api/Timeslot';
//import { WeekdayData } from './typechecking/api/Weekday';

//export function getNextWeekdayDate(weekday: WeekdayName): DateTime {
//  const targetWeekdayInt = weekdayToInt(weekday);
//  const today = DateTime.local().weekday;
//
//  let result: DateTime;
//  // We did not yet pass the target weekday in the current week...
//  if (today <= targetWeekdayInt) {
//    // hence, we can just use the target day from the current week
//    result = DateTime.local().set({ weekday: targetWeekdayInt });
//  } else {
//    // otherwise we need to get the target day from the next week
//    result = DateTime.local()
//      .plus(Duration.fromObject({ weeks: 1 }))
//      .set({ weekday: targetWeekdayInt });
//  }
//
//  return result.startOf('day');
//}
//
//export function getPreviousWeekdayDate(weekday: WeekdayName): DateTime {
//  const targetWeekdayInt = weekdayToInt(weekday);
//
//  const now = DateTime.local(); // FIXME: Keep server and client time synchronized
//  const today = now.weekday;
//
//  let result: DateTime;
//  // We did not yet pass the target weekday in the current week...
//  if (today <= targetWeekdayInt) {
//    // hence, we need to get the target day from the previous week
//    result = now
//      .minus(Duration.fromObject({ week: 1 }))
//      .set({ weekday: targetWeekdayInt });
//  } else {
//    // otherwise we can just use the target day from the current week
//    result = now.set({ weekday: targetWeekdayInt });
//  }
//
//  return result.startOf('day');
//}

//export function getPreviousTimeslotEndDate(
//  timeslot: TimeslotData,
//  weekday: WeekdayData
//): DateTime {
//  const previousDate = getPreviousWeekdayDate(weekday.name);
//
//  return previousDate.plus(
//    Duration.fromObject({
//      hour: timeslot.endHours,
//      minute: timeslot.endMinutes,
//    })
//  );
//}
