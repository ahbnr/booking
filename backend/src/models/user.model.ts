import {
  BeforeBulkCreate,
  BeforeBulkUpdate,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  IsEmail,
  NotEmpty,
} from 'sequelize-typescript';
import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { CreateOptions } from 'ts-node';
import bcrypt from 'bcrypt';
import { BaseModel } from './BaseModel';
import { RefreshToken } from './refreshtoken.model';

@Table
export class User extends BaseModel<User> {
  @PrimaryKey
  @NotEmpty
  @Column
  public name!: string;

  @IsEmail
  @Column({ allowNull: true })
  public email?: string;

  @NotEmpty
  @Column({ allowNull: false })
  public password!: string;

  @HasMany(() => RefreshToken, { onDelete: 'CASCADE' })
  public refreshTokens!: RefreshToken[];

  @BeforeCreate
  public static async onCreateHashPassword(instance: User) {
    // eslint-disable-next-line require-atomic-updates
    instance.password = await User.hashPassword(instance.password);
  }

  @BeforeBulkCreate
  public static async onBulkCreateHashPassword(
    instances: User[],
    _?: CreateOptions
  ) {
    await Promise.all(instances.map(User.onCreateHashPassword));
  }

  @BeforeUpdate
  public static async onUpdateHashPassword(instance: User) {
    await User.onCreateHashPassword(instance);
  }

  @BeforeBulkUpdate
  public static async onBulkUpdateHashPassword(
    instances: User[],
    options?: CreateOptions
  ) {
    await User.onBulkCreateHashPassword(instances, options);
  }

  private static async hashPassword(password: string): Promise<string> {
    // TODO: Ensure this hashing method is save enough
    return await bcrypt.hash(password, await bcrypt.genSalt(10));
  }

  public async doesPasswordMatch(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
