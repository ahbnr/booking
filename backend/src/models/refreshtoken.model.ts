import { BelongsTo, ForeignKey, NotEmpty } from 'sequelize-typescript';
import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { User } from './user.model';
import { LazyGetter } from '../utils/LazyGetter';
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
