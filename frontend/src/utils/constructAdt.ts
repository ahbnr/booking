import { ADT, ADTMember } from 'ts-adt';

export function construct<
  C extends string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends {},
  U extends { _type: C } & T
>(constructor: C, value: T): U {
  return ({
    _type: constructor,
    ...value,
  } as unknown) as U;
}
