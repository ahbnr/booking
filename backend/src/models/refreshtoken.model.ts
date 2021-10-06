import {
  BelongsTo,
  DataType,
  ForeignKey,
  NotEmpty,
} from 'sequelize-typescript';
import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { MAX_USER_NAME_LENGTH, User } from './user.model';
import { LazyGetter } from '../utils/LazyGetter';
import { DateTime } from 'luxon';

const NUM_REFRESH_TOKEN_BYTES = 128;

@Table
export class RefreshToken extends BaseModel<RefreshToken> {
  @PrimaryKey
  @NotEmpty
  // twice the refresh token byte size, since we store it in hex format
  @Column(DataType.STRING(NUM_REFRESH_TOKEN_BYTES * 2))
  public token!: string;

  @NotEmpty
  // twice the refresh token byte size, since we store it in hex format
  @Column(DataType.STRING(NUM_REFRESH_TOKEN_BYTES * 2))
  public activation!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(MAX_USER_NAME_LENGTH), allowNull: false })
  public userName!: string;

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  public user?: User;

  @LazyGetter<RefreshToken>((o) => o.user)
  public readonly lazyUser!: Promise<User>;

  @NotEmpty
  @Column
  public readonly expiresAt!: Date;

  public hasExpired(): boolean {
    const now = DateTime.local();

    return now >= DateTime.fromJSDate(this.expiresAt);
  }
}
