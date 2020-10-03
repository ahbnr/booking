import {Weekday} from "./models/Weekday";
import {Timeslot} from "./models/Timeslot";

export class ViewingWeekdays {
    public readonly type: 'ViewingWeekdays' = 'ViewingWeekdays'
}

export class ViewingTimeslots {
    public readonly type: 'ViewingTimeslots' = 'ViewingTimeslots'

    public readonly weekday: Weekday

    constructor(weekday: Weekday) {
        this.weekday = weekday;
    }
}

export class ViewingBookings {
    public readonly type: 'ViewingBookings' = 'ViewingBookings'

    public readonly timeslot: Timeslot

    constructor(timeslot: Timeslot) {
        this.timeslot = timeslot;
    }
}

export class CreateBooking {
    public readonly type: 'CreateBooking' = 'CreateBooking'

    public readonly timeslot: Timeslot

    constructor(timeslot: Timeslot) {
        this.timeslot = timeslot;
    }
}

export type InteractionState = ViewingWeekdays | ViewingTimeslots | ViewingBookings | CreateBooking;