import { Timeslot } from './Timeslot';

export interface BookingData {
  name: string;
}

export interface Booking {
  id: number;
  timeslot: Timeslot;
  data: BookingData;
}

export function fromData(
  id: number,
  timeslot: Timeslot,
  data: BookingData
): Booking {
  return {
    id: id,
    timeslot: timeslot,
    data: data,
  };
}
