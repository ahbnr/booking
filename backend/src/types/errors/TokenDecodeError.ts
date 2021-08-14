export class TokenDecodeError {
  public readonly message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly baseError?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, baseError?: any) {
    this.message = message;
    this.baseError = baseError;
  }
}
