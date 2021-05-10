import { randomBytes } from 'crypto';

/**
 * Promise-based version of crypto.randomBytes
 */
export default async function asyncRandomBytes(size: number): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) =>
    randomBytes(size, (err: Error | null, buffer: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    })
  );
}
