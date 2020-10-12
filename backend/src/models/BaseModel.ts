import { Model } from 'sequelize-typescript';

// eslint-disable-next-line @typescript-eslint/ban-types
type NonFunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never : T[K];
};

export class BaseModel<T extends Model<T>> extends Model<T> {
  /**
   * Get object representation which can be turned into JSON.
   * Same as `toJSON` but typed.
   *
   * Based on https://github.com/RobinBuschmann/sequelize-typescript/issues/617#issuecomment-491873054
   */
  public toTypedJSON(): NonFunctionPropertyNames<this> {
    return (super.toJSON() as unknown) as NonFunctionPropertyNames<this>;
  }
}
