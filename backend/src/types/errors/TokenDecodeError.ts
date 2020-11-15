export class TokenDecodeError {
  public readonly message: string;
  public readonly baseError?: any;

  constructor(message: string, baseError?: any) {
    this.message = message;
    this.baseError = baseError;
  }
}
