export class DataValidationError extends Error {
  public readonly baseError?: any;

  constructor(message: string, baseError?: any) {
    super(message);
    this.baseError = baseError;
  }
}
