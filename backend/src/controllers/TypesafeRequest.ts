import { Request } from 'express';

// eslint-disable-next-line @typescript-eslint/ban-types
type TypesafeRequest = Request<{}, unknown, unknown>;
export default TypesafeRequest;
