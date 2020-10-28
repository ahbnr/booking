import { ResourceGetInterface } from 'common';
import {
  TimeslotGetInterface,
  WeekdayGetInterface,
  WeekdayName,
} from 'common/dist';

import { ADT, ADTMember } from 'ts-adt';
import { Int } from 'io-ts';

export interface ViewingResources {}

export interface ViewingWeekdays {
  resource: ResourceGetInterface;
}

export interface ViewingTimeslots {
  weekday: WeekdayGetInterface;
}

export interface ViewingBookings {
  timeslot: TimeslotGetInterface;
}

export interface CreateBooking {
  timeslot: TimeslotGetInterface;
}

export interface Authenticating {}

export interface InvitingAdmin {}

export interface SigningUp {
  signupToken: string;
}

export interface LookingUpBookings {
  lookupToken: string;
}

export interface OverviewingDay {
  weekdayName: WeekdayName;
}

export type Activity = ADT<{
  viewingResources: ViewingResources;
  viewingWeekdays: ViewingWeekdays;
  viewingTimeslots: ViewingTimeslots;
  viewingBookings: ViewingBookings;
  createBooking: CreateBooking;
  authenticating: Authenticating;
  invitingAdmin: InvitingAdmin;
  signingUp: SigningUp;
  lookingUpBookings: LookingUpBookings;
  overviewingDay: OverviewingDay;
}>;

export function constructActivity<C extends Activity['_type']>(
  constructor: C,
  value: ADTMember<Activity, C>
): Activity {
  return {
    _type: constructor,
    ...value,
  } as Activity;
}

export class InteractionState {
  public readonly activity: Activity;
  private readonly previousInteractionState?: InteractionState;
  private readonly nextInteractionState?: InteractionState;

  constructor(
    activity: Activity,
    previousInteractionState?: InteractionState,
    nextInteractionState?: InteractionState
  ) {
    this.activity = activity;
    this.previousInteractionState = previousInteractionState;
    this.nextInteractionState = nextInteractionState;
  }

  goBack(): InteractionState | undefined {
    if (this.previousInteractionState != null) {
      return new InteractionState(
        this.previousInteractionState.activity,
        this.previousInteractionState.previousInteractionState,
        this
      );
    } else {
      return undefined;
    }
  }

  goNext(): InteractionState | undefined {
    if (this.nextInteractionState != null) {
      return new InteractionState(
        this.nextInteractionState.activity,
        this,
        this.nextInteractionState.nextInteractionState
      );
    } else {
      return undefined;
    }
  }

  changeActivity(newActivity: Activity): InteractionState {
    return new InteractionState(newActivity, this);
  }
}
