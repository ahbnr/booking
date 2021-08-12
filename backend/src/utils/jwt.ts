import jwt, { SignOptions, VerifyErrors, VerifyOptions } from 'jsonwebtoken';
import { jwtSecret } from '../config/passport';
import { DateTime } from 'luxon';
import { Unauthenticated } from '../controllers/errors';

export function asyncJwtVerify(
  token: string,
  options?: VerifyOptions
  // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<object> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return new Promise<object>((resolve, reject) =>
    // eslint-disable-next-line @typescript-eslint/ban-types
    jwt.verify(
      token,
      jwtSecret,
      options,
      // eslint-disable-next-line @typescript-eslint/ban-types
      (err: VerifyErrors | null, decoded?: object) => {
        if (err != null) {
          reject(new Unauthenticated(err.message));
        } else if (decoded != null) {
          resolve(decoded);
        } else {
          reject(new Unauthenticated('Token could not be verified.'));
        }
      }
    )
  );
}

export class TokenGenerationResult {
  public readonly token: string;
  public readonly expiresAt: DateTime;
  public readonly createdAt: DateTime;

  constructor(token: string, expiresAt: DateTime, createdAt: DateTime) {
    this.token = token;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
  }
}

export function asyncJwtSign(
  // eslint-disable-next-line @typescript-eslint/ban-types
  payload: string | Buffer | object,
  options: SignOptions & { expiresIn: number /* seconds */ }
): Promise<TokenGenerationResult> {
  const createdAt = DateTime.now();
  const expiresAt = createdAt.plus({ seconds: options.expiresIn });

  return new Promise<TokenGenerationResult>((resolve, reject) =>
    jwt.sign(
      payload,
      jwtSecret,
      options,
      (err: Error | null, token?: string) => {
        if (err != null) {
          reject(err);
        } else if (token != null) {
          resolve(new TokenGenerationResult(token, expiresAt, createdAt));
        } else {
          reject('Could not sign token');
        }
      }
    )
  );
}
