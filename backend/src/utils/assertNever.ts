export default function assertNever(message?: string): never {
  throw new Error(
    message != null
      ? message
      : 'This code should not be reachable and thus this is a programming error.'
  );
}
