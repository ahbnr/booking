import { Weekday } from './models/Weekday';
import { Timeslot } from './models/Timeslot';
import { Resource } from './models/Resource';

export class ViewingResources {
  public readonly type: 'ViewingResources' = 'ViewingResources';
}

export class ViewingWeekdays {
  public readonly type: 'ViewingWeekdays' = 'ViewingWeekdays';

  public readonly resource: Resource;

  constructor(resource: Resource) {
    this.resource = resource;
  }
}

export class ViewingTimeslots {
  public readonly type: 'ViewingTimeslots' = 'ViewingTimeslots';

  public readonly weekday: Weekday;

  constructor(weekday: Weekday) {
    this.weekday = weekday;
  }
}

export class ViewingBookings {
  public readonly type: 'ViewingBookings' = 'ViewingBookings';

  public readonly timeslot: Timeslot;

  constructor(timeslot: Timeslot) {
    this.timeslot = timeslot;
  }
}

export class CreateBooking {
  public readonly type: 'CreateBooking' = 'CreateBooking';

  public readonly timeslot: Timeslot;

  constructor(timeslot: Timeslot) {
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

export type InteractionState =
  | ViewingResources
  | ViewingWeekdays
  | ViewingTimeslots
  | ViewingBookings
  | CreateBooking
  | Authenticating
  | InvitingAdmin
  | SigningUp
  | LookingUpBookings;
