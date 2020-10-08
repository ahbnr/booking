import jwt, {
  GetPublicKeyOrSecret,
  Secret,
  SignOptions,
  VerifyErrors,
  VerifyOptions,
} from 'jsonwebtoken';

export function asyncJwtVerify(
  token: string,
  secretOrPublicKey: Secret | GetPublicKeyOrSecret,
  options?: VerifyOptions
  // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<object> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return new Promise<object>((resolve, reject) =>
    // eslint-disable-next-line @typescript-eslint/ban-types
    jwt.verify(
      token,
      secretOrPublicKey,
      options,
      // eslint-disable-next-line @typescript-eslint/ban-types
      (err: VerifyErrors | null, decoded?: object) => {
        if (err != null) {
          reject(err);
        } else if (decoded != null) {
          resolve(decoded);
        } else {
          reject('Token could not be verified.');
        }
      }
    )
  );
}

export function asyncJwtSign(
  // eslint-disable-next-line @typescript-eslint/ban-types
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  options: SignOptions
): Promise<string> {
  return new Promise<string>((resolve, reject) =>
    jwt.sign(
      payload,
      secretOrPrivateKey,
      options,
      (err: Error | null, token?: string) => {
        if (err != null) {
          reject(err);
        } else if (token != null) {
          resolve(token);
        } else {
          reject('Could not sign token');
        }
      }
    )
  );
}
