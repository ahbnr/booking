import { ResourceGetInterface } from 'common';
import {
  TimeslotGetInterface,
  WeekdayGetInterface,
  WeekdayName,
} from 'common/dist';

export class ViewingResources {
  public readonly type: 'ViewingResources' = 'ViewingResources';
}

export class ViewingWeekdays {
  public readonly type: 'ViewingWeekdays' = 'ViewingWeekdays';

  public readonly resource: ResourceGetInterface;

  constructor(resource: ResourceGetInterface) {
    this.resource = resource;
  }
}

export class ViewingTimeslots {
  public readonly type: 'ViewingTimeslots' = 'ViewingTimeslots';

  public readonly weekday: WeekdayGetInterface;

  constructor(weekday: WeekdayGetInterface) {
    this.weekday = weekday;
  }
}

export class ViewingBookings {
  public readonly type: 'ViewingBookings' = 'ViewingBookings';

  public readonly timeslot: TimeslotGetInterface;

  constructor(timeslot: TimeslotGetInterface) {
    this.timeslot = timeslot;
  }
}

export class CreateBooking {
  public readonly type: 'CreateBooking' = 'CreateBooking';

  public readonly timeslot: TimeslotGetInterface;

  constructor(timeslot: TimeslotGetInterface) {
    this.timeslot = timeslot;
  }
}

export class Authenticating {
  public readonly type: 'Authenticating' = 'Authenticating';
}

export class InvitingAdmin {
  public readonly type: 'InvitingAdmin' = 'InvitingAdmin';
}

export class SigningUp {
  public readonly type: 'SigningUp' = 'SigningUp';

  public readonly signupToken: string;

  constructor(signupToken: string) {
    this.signupToken = signupToken;
  }
}

export class LookingUpBookings {
  public readonly type: 'LookingUpBookings' = 'LookingUpBookings';

  public readonly lookupToken: string;

  constructor(lookupToken: string) {
    this.lookupToken = lookupToken;
  }
}

export class OverviewingDay {
  public readonly type: 'OverviewingDay' = 'OverviewingDay';

  public readonly weekdayName: WeekdayName;

  constructor(weekdayName: WeekdayName) {
    this.weekdayName = weekdayName;
  }
}

export type InteractionState =
  | ViewingResources
  | ViewingWeekdays
  | ViewingTimeslots
  | ViewingBookings
  | CreateBooking
  | Authenticating
  | InvitingAdmin
  | SigningUp
  | LookingUpBookings
  | OverviewingDay;
