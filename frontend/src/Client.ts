import * as t from 'io-ts';
import { Type } from 'io-ts';
import { boundClass } from 'autobind-decorator';
import {
  AuthRequestData,
  BookingGetInterface,
  BookingPostInterface,
  checkType,
  EMailString,
  InviteForSignupData,
  IsSignupTokenOkRequestData,
  NonEmptyString,
  ResourceGetInterface,
  SignupRequestData,
  TimeslotGetInterface,
  TimeslotPostInterface,
  WeekdayGetInterface,
  WeekdayPostInterface,
} from 'common/dist';

const address = 'localhost';
const port = 3000;
const baseUrl = `http://${address}:${port}`;

class RequestError {
  public readonly response: Response;

  constructor(response: Response) {
    this.response = response;
  }
}

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

  private async typedRequest<A, O, I>(
    type: Type<A, O, I>,
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    subUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any
  ): Promise<A> {
    const response = await this.request(method, subUrl, body);
    const parsed = await response.json();

    return checkType(parsed, type);
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

    if (!response.ok) {
      throw new RequestError(response);
    }

    return response;
  }

  public async isSignupTokenOk(signupToken: string): Promise<boolean> {
    const postData: IsSignupTokenOkRequestData = signupToken;

    return await this.typedRequest(
      t.boolean,
      'POST',
      'users/isSignupTokenOk',
      postData
    );
  }

  public async signup(
    signupToken: NonEmptyString,
    username: NonEmptyString,
    password: NonEmptyString
  ) {
    this.jsonWebToken = undefined;

    const data: SignupRequestData = {
      signupToken: signupToken,
      userData: {
        name: username,
        password: password,
        email: undefined,
      },
    };

    this.jsonWebToken = await this.typedRequest(
      NonEmptyString,
      'POST',
      'users/signup',
      data
    );
  }

  public async authenticate(username: string, password: string) {
    this.jsonWebToken = undefined;

    const data: AuthRequestData = {
      username: username,
      password: password,
    };

    this.jsonWebToken = await this.typedRequest(
      NonEmptyString,
      'POST',
      'users/auth',
      data
    );
  }

  public async inviteForSignup(email: EMailString, signupPath: string) {
    const data: InviteForSignupData = {
      email: email,
      targetUrl: signupPath,
    };

    await this.request('POST', 'users/inviteForSignup', data);
  }

  public async getTimeslot(timeslotId: number): Promise<TimeslotGetInterface> {
    return await this.typedRequest(
      TimeslotGetInterface,
      'GET',
      `timeslots/${timeslotId}`
    );
  }

  public async getTimeslots(
    weekdayId: number
  ): Promise<TimeslotGetInterface[]> {
    return await this.typedRequest(
      t.array(TimeslotGetInterface),
      'GET',
      `weekdays/${weekdayId}/timeslots`
    );
  }

  public async createTimeslot(weekdayId: number, data: TimeslotPostInterface) {
    await this.request('POST', `weekdays/${weekdayId}/timeslots`, data);
  }

  public async updateTimeslot(timeslotId: number, data: TimeslotPostInterface) {
    await this.request('PUT', `timeslots/${timeslotId}`, data);
  }

  public async deleteTimeslot(timeslotId: number) {
    await this.request('DELETE', `timeslots/${timeslotId}`);
  }

  public async getResources(): Promise<ResourceGetInterface[]> {
    return await this.typedRequest(
      t.array(ResourceGetInterface),
      'GET',
      'resources'
    );
  }

  public async createResource(resourceName: string) {
    await this.request('POST', `resources/${resourceName}`);
  }

  public async deleteResource(weekdayName: string) {
    await this.request('DELETE', `resources/${weekdayName}`);
  }

  public async getWeekday(weekdayId: number): Promise<WeekdayGetInterface> {
    return await this.typedRequest(
      WeekdayGetInterface,
      'GET',
      `weekdays/${weekdayId}`
    );
  }

  public async getWeekdays(
    resourceName: string
  ): Promise<WeekdayGetInterface[]> {
    return await this.typedRequest(
      t.array(WeekdayGetInterface),
      'GET',
      `resources/${resourceName}/weekdays`
    );
  }

  public async createWeekday(resourceName: string, data: WeekdayPostInterface) {
    await this.request('POST', `resources/${resourceName}/weekdays`, data);
  }

  public async deleteWeekday(weekdayId: number) {
    await this.request('DELETE', `weekdays/${weekdayId}`);
  }

  public async createBooking(timeslotId: number, data: BookingPostInterface) {
    await this.request('POST', `timeslots/${timeslotId}/bookings`, data);
  }

  public async getBooking(bookingId: number): Promise<BookingGetInterface> {
    return await this.typedRequest(
      BookingGetInterface,
      'GET',
      `bookings/${bookingId}`
    );
  }

  public async getBookings(timeslotId: number): Promise<BookingGetInterface[]> {
    return await this.typedRequest(
      t.array(BookingGetInterface),
      'GET',
      `timeslots/${timeslotId}/bookings`
    );
  }

  public async getBookingsByToken(
    lookupToken: string
  ): Promise<BookingGetInterface[]> {
    return await this.typedRequest(
      t.array(BookingGetInterface),
      'GET',
      `bookings?token=${lookupToken}`
    );
  }

  public async deleteBooking(bookingId: number) {
    await this.request('DELETE', `bookings/${bookingId}`);
  }
}
