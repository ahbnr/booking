import * as t from 'io-ts';

export const SetUnreliableMailDomainsRequest = t.readonlyArray(t.string);

export type SetUnreliableMailDomainsRequest = t.TypeOf<
  typeof SetUnreliableMailDomainsRequest
>;
