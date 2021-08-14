import TypesafeRequest from './TypesafeRequest';
import { hasProperty } from 'common/dist';
import { MissingPathParameter, UnprocessableEntity } from './errors';

export function extractNumericIdFromRequest(req: TypesafeRequest): number {
  if (hasProperty(req.params, 'id')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeId = parseInt(req.params.id as any);

    if (isNaN(maybeId)) {
      throw new UnprocessableEntity('No numeric id given.');
    } else {
      return maybeId;
    }
  } else {
    throw new MissingPathParameter('id');
  }
}
