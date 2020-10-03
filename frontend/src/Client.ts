import {fromData as timeslotFromData, Timeslot, TimeslotData} from "./models/Timeslot";
import {Weekday} from "./models/Weekday";
import {Booking, BookingData, fromData as bookingFromData} from "./models/Booking";

export class Client {
    private static readonly address = 'localhost';
    private static readonly port = 3000;

    private static readonly baseUrl = `http://${Client.address}:${Client.port}`

    private static async request(method: "POST" | "GET" | "PUT" | "DELETE", subUrl: string, body?: any): Promise<Response> {
        if (body != null) {
            return await fetch(`${this.baseUrl}/${subUrl}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        }

        else {
            return await fetch(`${this.baseUrl}/${subUrl}`, {
                method: method
            });
        }
    }

    public static async getTimeslot(timeslotId: number): Promise<Timeslot> {
        const timeslotResponse = await (
            await this.request('GET', `timeslots/${timeslotId}`)
        ).json();

        return timeslotFromData(
            timeslotResponse.id,
            timeslotResponse.weekday,
            timeslotResponse.bookings,
            {
                startHours: timeslotResponse.startHours,
                startMinutes: timeslotResponse.startMinutes,
                endHours: timeslotResponse.endHours,
                endMinutes: timeslotResponse.endMinutes,
                capacity: timeslotResponse.capacity
            }
        )
    }

    public static async getTimeslots(weekdayName: string): Promise<Timeslot[]> {
        const timeslotsResponse = await (
                await this.request('GET', `weekdays/${weekdayName}/timeslots`)
            ).json();

        return timeslotsResponse
            .map((timeslot: any) => timeslotFromData(
                timeslot.id,
                timeslot.weekday,
                timeslot.bookings,
                {
                    startHours: timeslot.startHours,
                    startMinutes: timeslot.startMinutes,
                    endHours: timeslot.startMinutes,
                    endMinutes: timeslot.startMinutes,
                    capacity: timeslot.capacity
                }
            ));
    }

    public static async createTimeslot(
        weekdayName: string,
        data: TimeslotData
    ) {
        await this.request('POST', `weekdays/${weekdayName}/timeslots`, data)
    }

    public static async updateTimeslot(
        timeslotId: number,
        data: TimeslotData,
    ) {
        await this.request('PUT', `timeslots/${timeslotId}`, data)
    }

    public static async deleteTimeslot(timeslotId: number) {
        await this.request('DELETE', `timeslots/${timeslotId}`);
    }

    public static async getWeekdays(): Promise<Weekday[]> {
        return await (
            await this.request('GET', 'weekdays')
        ).json();
    }

    public static async createWeekday(weekdayName: string) {
        await this.request('POST', `weekdays/${weekdayName}`);
    }

    public static async deleteWeekday(weekdayName: string) {
        await this.request('DELETE', `weekdays/${weekdayName}`);
    }

    public static async createBooking(timeslotId: number, data: BookingData) {
        const response = await this.request('POST', `timeslots/${timeslotId}/bookings`, data);

        if (!response.ok) {
            throw new Error(`Creating booking failed: ${response.body}`);
        }
    }

    public static async getBooking(bookingId: number): Promise<Booking> {
        const response = await (
            await this.request('GET', `bookings/${bookingId}`)
        ).json();

        return bookingFromData(
            response.id,
            response.timeslot,
            {
                name: response.name
            }
        )
    }

    public static async getBookings(timeslotId: number): Promise<Booking[]> {
        const response = await this.request('GET', `timeslots/${timeslotId}/bookings`);

        return await response.json();
    }

    public static async deleteBooking(bookingId: number) {
        await this.request('DELETE', `bookings/${bookingId}`);
    }
}