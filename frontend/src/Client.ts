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
  BookingWithContextGetInterface,
  AuthResponseData,
  BookingIntervalIndexRequestData,
} from 'common/dist';
import DisplayableError from './errors/DisplayableError';
import { DateTime } from 'luxon';

//const { REACT_APP_API_ADDRESS, REACT_APP_API_PORT } = process.env;

//const address = REACT_APP_API_ADDRESS || window.location.hostname;
//const port = REACT_APP_API_PORT || 3000;
//const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
//const baseUrl = `${protocol}://${address}:${port}`;

const baseUrl = 'api';

class RequestError {
  public readonly response: Response;

  constructor(response: Response) {
    this.response = response;
  }
}

class JsonWebTokenData {
  public readonly token: string;
  public readonly expiresAt: DateTime;

  constructor(token: string, expiresAt: DateTime) {
    this.token = token;
    this.expiresAt = expiresAt;
  }

  public hasExpired(): boolean {
    const now = DateTime.now();

    return now >= this.expiresAt;
  }
}

@boundClass
export class Client {
  private _jwtStore?: JsonWebTokenData;
  private set jsonWebToken(value: JsonWebTokenData | undefined) {
    this._jwtStore = value;

    if (this.onAuthenticationChanged != null) {
      this.onAuthenticationChanged(this.isAuthenticated());
    }
  }

  private get jsonWebToken(): JsonWebTokenData | undefined {
    if (this._jwtStore?.hasExpired()) {
      this.jsonWebToken = undefined;
    }

    return this._jwtStore;
  }

  public onAuthenticationChanged?: (isAuthenticated: boolean) => unknown;

  public isAuthenticated(): boolean {
    return this.jsonWebToken != null;
  }

  public async logout() {
    try {
      await this.request('POST', 'auth/logout', {}, true);
    } catch (e) {
      console.log(
        `Could not log out at server (${JSON.stringify(
          e
        )}). This is not so bad, since we can simply delete the local auth data.`
      );
    } finally {
      this.jsonWebToken = undefined;
      // Delete refresh token activation cookie
      document.cookie =
        'refreshTokenActivation=;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Strict;';
    }
  }

  private async typedRequest<A, O, I>(
    type: Type<A, O, I>,
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    subUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    dontAutoAuth?: boolean
  ): Promise<A> {
    const response = await this.request(method, subUrl, body, dontAutoAuth);
    const parsed = await response.json();

    return checkType(parsed, type);
  }

  private async request(
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    subUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    dontAutoAuth?: boolean
  ): Promise<Response> {
    const headers: HeadersInit = {};

    if (!dontAutoAuth && !this.isAuthenticated()) {
      await this.tryAutoAuth();
    }

    if (this.isAuthenticated() && this.jsonWebToken != null) {
      headers['Authorization'] = `Bearer ${this.jsonWebToken.token}`;
    }

    let response: Response;
    try {
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
    } catch (e) {
      throw new DisplayableError(
        'Es gibt ein Problem mit der Netzwerkverbindung. Versuchen Sie es später erneut',
        e
      );
    }

    // If authentication failed
    if (response.status === 401) {
      try {
        await this.logout();
      } catch (e) {
        console.error(
          'Authentication failed, so we attempted logout. However, that failed too :/'
        );
      }
    }

    if (!response.ok) {
      throw new RequestError(response);
    }

    return response;
  }

  public async isSignupTokenOk(signupToken: string): Promise<boolean> {
    const postData: IsSignupTokenOkRequestData = checkType(
      {
        signupToken: signupToken,
      },
      IsSignupTokenOkRequestData
    );

    return await this.typedRequest(
      t.boolean,
      'POST',
      'auth/is_signup_token_ok',
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
      },
    };

    await this.request('POST', 'auth/signup', data);

    await this.authenticate(username, password);
  }

  public async tryAutoAuth() {
    if (!this.isAuthenticated()) {
      // Try getting a new auth token using a refresh token (might be set as HttpOnly cookie)
      try {
        await this.getAuthTokenWithRefreshToken();
      } catch (e) {
        console.log(
          `Could not automatically authenticate with refresh token. New refresh token via login is required.`
        );
      }
    } else {
      console.log(`Authenticated until: ${this.jsonWebToken?.expiresAt}`);
    }
  }

  private async getAuthTokenWithRefreshToken() {
    // TODO: Maybe only allow authentication when connection is secure (SSL) so that data is never leaked?`
    // Likewise, all requests requiring sending an auth token should also enforce SSL

    const response = await this.typedRequest(
      AuthResponseData,
      'GET',
      'auth/auth_token',
      undefined,
      true
    );

    const authToken = response.authToken;
    const expiresAt = DateTime.fromISO(response.expiresAt);

    this.jsonWebToken = new JsonWebTokenData(authToken, expiresAt);

    console.log(
      `Successfully authenticated until: ${this.jsonWebToken?.expiresAt}`
    );
  }

  public async authenticate(username: string, password: string) {
    // TODO: Maybe only allow authentication when connection is secure (SSL) so that data is never leaked?`
    // Likewise, all requests requiring sending an auth token should also enforce SSL
    this.jsonWebToken = undefined;

    const data: AuthRequestData = {
      username: username,
      password: password,
    };

    await this.request('POST', 'auth/login', data, true);

    await this.tryAutoAuth();
  }

  public async inviteForSignup(email: EMailString, signupPath: string) {
    const data: InviteForSignupData = {
      email: email,
      targetUrl: signupPath,
    };

    await this.request('POST', 'auth/invite', data);
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

  public async getWeekdaysForResource(
    resourceName: string
  ): Promise<WeekdayGetInterface[]> {
    return await this.typedRequest(
      t.array(WeekdayGetInterface),
      'GET',
      `resources/${resourceName}/weekdays`
    );
  }

  public async getWeekdays(): Promise<WeekdayGetInterface[]> {
    return await this.typedRequest(
      t.array(WeekdayGetInterface),
      'GET',
      'weekdays'
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

  public async getBookingsInInterval(
    data: BookingIntervalIndexRequestData
  ): Promise<BookingWithContextGetInterface[]> {
    return await this.typedRequest(
      t.array(BookingWithContextGetInterface),
      'POST',
      'bookings/inInterval',
      data
    );
  }

  public async deleteBooking(bookingId: number) {
    await this.request('DELETE', `bookings/${bookingId}`);
  }

  public async deleteBookingByToken(bookingId: number, lookupToken: string) {
    await this.request('DELETE', `bookings/${bookingId}?token=${lookupToken}`);
  }
}
