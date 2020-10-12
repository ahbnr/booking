export class DataValidationError {
  public readonly message: string;
  public readonly baseError?: any;

  constructor(message: string, baseError?: any) {
    this.message = message;
    this.baseError = baseError;
  }
}
