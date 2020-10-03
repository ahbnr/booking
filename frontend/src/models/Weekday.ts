export interface Weekday {
  name: string;
}

export const weekdayNameToISOWeekday: Map<string, number> = new Map([
  ['sunday', 0],
  ['monday', 1],
  ['tuesday', 2],
  ['wednesday', 3],
  ['thursday', 4],
  ['friday', 5],
  ['saturday', 6],
]);

// noinspection JSUnusedGlobalSymbols
export const isoWeekdayToName: Map<number, string> = new Map([
  [0, 'sunday'],
  [1, 'monday'],
  [2, 'tuesday'],
  [3, 'wednesday'],
  [4, 'thursday'],
  [5, 'friday'],
  [6, 'saturday'],
]);

export const weekdayNames = new Set<string>(weekdayNameToISOWeekday.keys());

export function nameSorter(left: string, right: string): number {
  return (
    weekdayNameToISOWeekday.getOrDefault(left, -1) -
    weekdayNameToISOWeekday.getOrDefault(right, -1)
  );
}
