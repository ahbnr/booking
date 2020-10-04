import {
  fromData as timeslotFromData,
  Timeslot,
  TimeslotData,
} from './models/Timeslot';
import { Weekday, weekdayFromResponseData } from './models/Weekday';
import {
  Booking,
  BookingData,
  fromData as bookingFromData,
} from './models/Booking';
import { boundClass } from 'autobind-decorator';
import { hasProperty } from './utils/typechecking';
import { Resource } from './models/Resource';

const address = 'localhost';
const port = 3000;
const baseUrl = `http://${address}:${port}`;

@boundClass
export class Client {
  private _jwtStore?: string;
  private set jsonWebToken(value: string | undefined) {
    this._jwtStore = value;

    if (this.onAuthenticationChanged != null) {
      this.onAuthenticationChanged(this.isAuthenticated());
    }
  }

  private get jsonWebToken(): string | undefined {
    return this._jwtStore;
  }

  public onAuthenticationChanged?: (isAuthenticated: boolean) => unknown;

  public isAuthenticated(): boolean {
    return this.jsonWebToken != null;
  }

  private async request(
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    subUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any
  ): Promise<Response> {
    const headers: HeadersInit = {};

    if (this.jsonWebToken != null) {
      headers['Authorization'] = `Bearer ${this.jsonWebToken}`;
    }

    let response: Response;
    if (body != null) {
      headers['Content-Type'] = 'application/json';

      response = await fetch(`${baseUrl}/${subUrl}`, {
        method: method,
        headers: headers,
        body: JSON.stringify(body),
      });
    } else {
      response = await fetch(`${baseUrl}/${subUrl}`, {
        headers: headers,
        method: method,
      });
    }

    // If authentication failed
    if (response.status === 401) {
      this.jsonWebToken = undefined;
    }

    return response;
  }

  public async authenticate(username: string, password: string) {
    this.jsonWebToken = undefined;

    const response = await this.request('POST', 'users/auth', {
      user: username,
      password: password,
    });

    if (response.status === 200) {
      const maybeTokenResponse = await response.json();

      // FIXME use JSON schema validation
      if (
        maybeTokenResponse != null &&
        typeof maybeTokenResponse === 'object' &&
        hasProperty(maybeTokenResponse, 'jwt')
      ) {
        this.jsonWebToken = maybeTokenResponse.jwt;
      } else {
        throw Error('Invalid server response format.');
      }
    } else {
      throw Error('Authentication failed.');
    }
  }

  public async getTimeslot(timeslotId: number): Promise<Timeslot> {
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
        capacity: timeslotResponse.capacity,
      }
    );
  }

  public async getTimeslots(weekdayId: number): Promise<Timeslot[]> {
    const timeslotsResponse = await (
      await this.request('GET', `weekdays/${weekdayId}/timeslots`)
    ).json();

    return timeslotsResponse.map((timeslot: any) =>
      timeslotFromData(timeslot.id, timeslot.weekday, timeslot.bookings, {
        startHours: timeslot.startHours,
        startMinutes: timeslot.startMinutes,
        endHours: timeslot.startMinutes,
        endMinutes: timeslot.startMinutes,
        capacity: timeslot.capacity,
      })
    );
  }

  public async createTimeslot(weekdayId: number, data: TimeslotData) {
    await this.request('POST', `weekdays/${weekdayId}/timeslots`, data);
  }

  public async updateTimeslot(timeslotId: number, data: TimeslotData) {
    await this.request('PUT', `timeslots/${timeslotId}`, data);
  }

  public async deleteTimeslot(timeslotId: number) {
    await this.request('DELETE', `timeslots/${timeslotId}`);
  }

  public async getResources(): Promise<Resource[]> {
    return await (await this.request('GET', 'resources')).json();
  }

  public async createResource(resourceName: string) {
    await this.request('POST', `resources/${resourceName}`);
  }

  public async deleteResource(weekdayName: string) {
    await this.request('DELETE', `resources/${weekdayName}`);
  }

  public async getWeekdays(resourceName: string): Promise<Weekday[]> {
    const weekdaysResponse = await (
      await this.request('GET', `resources/${resourceName}/weekdays`)
    ).json();

    return weekdaysResponse.map((weekdayResponseData: any) =>
      weekdayFromResponseData(weekdayResponseData)
    );
  }

  public async createWeekday(resourceName: string, weekdayName: string) {
    await this.request('POST', `resources/${resourceName}/weekdays`, {
      name: weekdayName,
    });
  }

  public async deleteWeekday(weekdayId: number) {
    await this.request('DELETE', `weekdays/${weekdayId}`);
  }

  public async createBooking(timeslotId: number, data: BookingData) {
    const response = await this.request(
      'POST',
      `timeslots/${timeslotId}/bookings`,
      data
    );

    if (!response.ok) {
      throw new Error(`Creating booking failed: ${response.body}`);
    }
  }

  public async getBooking(bookingId: number): Promise<Booking> {
    const response = await (
      await this.request('GET', `bookings/${bookingId}`)
    ).json();

    return bookingFromData(response.id, response.timeslot, {
      name: response.name,
    });
  }

  public async getBookings(timeslotId: number): Promise<Booking[]> {
    const response = await this.request(
      'GET',
      `timeslots/${timeslotId}/bookings`
    );

    return await response.json();
  }

  public async deleteBooking(bookingId: number) {
    await this.request('DELETE', `bookings/${bookingId}`);
  }
}
