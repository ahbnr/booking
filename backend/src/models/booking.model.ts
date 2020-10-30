import {
  CreatedAt,
  DataType,
  IsDate,
  IsEmail,
  NotEmpty,
} from 'sequelize-typescript';
import { Timeslot } from './timeslot.model';
import {
  BelongsTo,
  Column,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DateTime, Duration, Interval } from 'luxon';
import { LazyGetter } from '../utils/LazyGetter';
import { BaseModel } from './BaseModel';

export const VerificationTimeout = Duration.fromObject({ minutes: 10 });

@Table
export class Booking extends BaseModel<Booking> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Timeslot)
  @Column({ allowNull: false })
  public timeslotId!: number;

  @NotEmpty
  @Column({ allowNull: false })
  public name!: string;

  @IsEmail
  @Column({ allowNull: false })
  public email!: string;

  @IsDate
  @Column({ allowNull: false })
  public startDate!: Date;

  @IsDate
  @Column({ allowNull: false })
  public endDate!: Date;

  @Column({ allowNull: false, defaultValue: false })
  public isVerified!: boolean;

  @BelongsTo(() => Timeslot, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public timeslot?: Timeslot;

  @LazyGetter<Booking>((o) => o.timeslot, { shouldBePresent: true })
  public readonly lazyTimeslot!: Promise<Timeslot>;

  @CreatedAt
  public readonly createdAt!: Date;

  public timeTillDue(): Duration {
    const now = DateTime.local();
    const interval = Interval.fromDateTimes(now, this.endDate);

    return interval.toDuration();
  }

  public hasPassed(): boolean {
    const now = DateTime.local();

    const verificationExpired =
      !this.isVerified &&
      now >= DateTime.fromJSDate(this.createdAt).plus(VerificationTimeout);
    const endDateReached = now >= DateTime.fromJSDate(this.endDate);

    return verificationExpired || endDateReached;
  }
}
