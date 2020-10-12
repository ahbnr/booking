import * as t from 'io-ts';
import { NonEmptyString } from '../NonEmptyString';

export const ResourceData = t.type({
  name: NonEmptyString,
});

export type ResourceData = t.TypeOf<typeof ResourceData>;

export const ResourceGetInterface = t.type({
  ...ResourceData.props,
  weekdayIds: t.readonlyArray(t.number),
});

export type ResourceGetInterface = t.TypeOf<typeof ResourceGetInterface>;

export const ResourcePostInterface = t.type({});
export type ResourcePostInterface = t.TypeOf<typeof ResourcePostInterface>;
