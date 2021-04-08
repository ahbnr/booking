export class ControllerError {
  public readonly message: string;
  public readonly errorCode?: number;

  constructor(message: string, errorCode: number) {
    this.message = message;
    this.errorCode = errorCode;
  }
}

export class MissingPathParameter extends ControllerError {
  constructor(...missingParameters: string[]) {
    super(
      `The following parameters were missing from the request path: ${missingParameters}. This should never happen and is programming error in the routing.`,
      500
    );
  }
}

export class ElementNotFound extends ControllerError {
  constructor(elementType?: string) {
    super(`Could not locate ${elementType || 'element'} instance.`, 404);
  }
}
