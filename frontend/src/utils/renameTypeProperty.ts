/**
 * Source: https://stackoverflow.com/a/52702528
 */
type Rename<T, K extends keyof T, N extends string> = Pick<
  T,
  Exclude<keyof T, K>
> &
  { [P in N]: T[K] };

export default Rename;
