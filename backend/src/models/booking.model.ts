import { DataType, IsDate, IsEmail, NotEmpty } from 'sequelize-typescript';
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

  @BelongsTo(() => Timeslot, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public timeslot?: Timeslot;

  @LazyGetter<Booking>((o) => o.timeslot, { shouldBePresent: true })
  public readonly lazyTimeslot!: Promise<Timeslot>;

  public timeTillDue(): Duration {
    const now = DateTime.local();
    const interval = Interval.fromDateTimes(now, this.endDate);

    return interval.toDuration();
  }

  public hasPassed(): boolean {
    const now = DateTime.local();

    return now >= DateTime.fromJSDate(this.endDate);
  }
}
