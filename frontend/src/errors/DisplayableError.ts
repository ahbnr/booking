export default class DisplayableError extends Error {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = DisplayableError.name;

    this.originalError = originalError;
  }
}
