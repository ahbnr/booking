export class ControllerError {
  public readonly message: string;
  public readonly errorCode?: number;

  constructor(message: string, errorCode?: number) {
    this.message = message;
    this.errorCode = errorCode;
  }
}
