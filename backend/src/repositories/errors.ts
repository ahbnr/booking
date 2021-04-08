/**
 * Thrown if repository element is supposed to be created but unique keys already exist
 */
import { ControllerError } from '../controllers/errors';

export class DataIdAlreadyExists extends ControllerError {
  constructor() {
    super('Repository element already exists', 409);
  }
}

export class NoElementToUpdate extends ControllerError {
  constructor(elementType?: string) {
    super(
      `Could not update ${
        elementType || 'element'
      } since no such element with this id is in the database.`,
      404
    );
  }
}

export class NoElementToDestroy extends ControllerError {
  constructor(elementType?: string) {
    super(
      `Could not destroy ${
        elementType || 'element'
      } since no such element with this id is in the database.`,
      404
    );
  }
}
