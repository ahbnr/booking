import * as t from 'io-ts';

export const SettingsData = t.type({
  bookingDeadlineMillis: t.number,
  maxBookingWeekDistance: t.number,
});

export type SettingsData = t.TypeOf<typeof SettingsData>;

export const SettingsGetInterface = SettingsData;

export type SettingsGetInterface = t.TypeOf<typeof SettingsGetInterface>;

export const SettingsPostInterface = SettingsData;
export type SettingsPostInterface = t.TypeOf<typeof SettingsPostInterface>;
