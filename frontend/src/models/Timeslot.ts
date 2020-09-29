import {Booking} from "./Booking";

export interface Timeslot {
    id: number;

    startHours: number;
    startMinutes: number;
    endHours: number;
    endMinutes: number;

    booking?: Booking;
}

export class TimeslotGroup {
    public readonly timeslots: Timeslot[];

    constructor(timeslots: Timeslot[]) {
        if (timeslots.length <= 0) {
            throw new RangeError("A timeslot group must at least have one element.")
        }

        this.timeslots = timeslots;
    }

    public static compare(left: TimeslotGroup, right: TimeslotGroup): number {
        if (left.timeslots[0].startHours < right.timeslots[0].startHours) {
            return -1;
        }

        else if (left.timeslots[0].startHours > right.timeslots[0].startHours) {

        }
    }
}