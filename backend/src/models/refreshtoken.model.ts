import {
  BeforeBulkCreate,
  BeforeBulkUpdate,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  CreatedAt,
  ForeignKey,
  IsEmail,
  NotEmpty,
} from 'sequelize-typescript';
import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { CreateOptions } from 'ts-node';
import bcrypt from 'bcrypt';
import { BaseModel } from './BaseModel';
import { Resource } from './resource.model';
import { User } from './user.model';
import { Weekday } from './weekday.model';
import { LazyGetter } from '../utils/LazyGetter';
import { Booking, VerificationTimeout } from './booking.model';
import { DateTime } from 'luxon';

@Table
export class RefreshToken extends BaseModel<RefreshToken> {
  @PrimaryKey
  @NotEmpty
  @Column
  public token!: string;

  @NotEmpty
  @Column
  public activation!: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
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
