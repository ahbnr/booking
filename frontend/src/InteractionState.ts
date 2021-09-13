import {
  TimeslotGetInterface,
  ResourceGetInterface,
  WeekdayName,
  NonEmptyString,
} from 'common';
import { DateTime } from 'luxon';

import { ADT } from 'ts-adt';

export interface ViewingPrivacyNote {}

export interface ViewingResources {}

export interface ViewingWeekdays {
  resource: ResourceGetInterface;
}

export interface ViewingTimeslots {
  resourceName: string;
  weekdayId: number;
  bookingDay: DateTime;
}

export interface ViewingBookings {
  resourceName: string;
  timeslotId: number;
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
}

export interface EnteringName {
  resourceName: string;
  timeslotId: number;
  timeslotCapacity: number;
  numBookingsForSlot: number;
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
}

export interface AskingAboutAdditionalParticipants extends EnteringName {
  name: NonEmptyString;
  numHistoryToClearOnSubmit: number;
}

export interface AddingParticipant extends EnteringName {
  participantNames: NonEmptyString[];
  numHistoryToClearOnSubmit: number;
}

export interface ConfirmingParticipants extends AddingParticipant {}

export interface EnteringEmail extends ConfirmingParticipants {}

export interface Authenticating {}

export interface InvitingAdmin {}

export interface SigningUp {
  signupToken: string;
}

export interface LookingUpBookings {
  lookupToken: string;
}

export interface OverviewingDay {
  weekdayId: number;
  bookingDay: DateTime;
}

export interface EditingTimeslot {
  timeslot: TimeslotGetInterface;
}

export interface CreatingTimeslot {
  weekdayId: number;
}

export interface AddingWeekday {
  existingWeekdayNames: Set<WeekdayName>;
  resource: ResourceGetInterface;
}

export interface ViewingMainPage {}

export interface ConfirmingBookingDialog {
  numHistoryToClearOnSubmit: number;
}

export interface SelectingWeekdayOverview {}

export interface UpdatingSettings {}

export type Activity = ADT<{
  viewingPrivacyNote: ViewingPrivacyNote;
  viewingResources: ViewingResources;
  viewingWeekdays: ViewingWeekdays;
  viewingTimeslots: ViewingTimeslots;
  viewingBookings: ViewingBookings;
  enteringName: EnteringName;
  askingAboutAdditionalParticipants: AskingAboutAdditionalParticipants;
  addingParticipant: AddingParticipant;
  confirmingParticipants: ConfirmingParticipants;
  enteringEmail: EnteringEmail;
  authenticating: Authenticating;
  invitingAdmin: InvitingAdmin;
  signingUp: SigningUp;
  lookingUpBookings: LookingUpBookings;
  overviewingDay: OverviewingDay;
  editingTimeslot: EditingTimeslot;
  creatingTimeslot: CreatingTimeslot;
  addingWeekday: AddingWeekday;
  viewingMainPage: ViewingMainPage;
  confirmingBookingDialog: ConfirmingBookingDialog;
  selectingWeekdayOverview: SelectingWeekdayOverview;
  updatingSettings: UpdatingSettings;
}>;

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
