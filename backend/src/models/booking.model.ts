import { DataType, IsEmail, NotEmpty } from 'sequelize-typescript';
import { Timeslot } from './timeslot.model';
import moment from 'moment';
import {
  BelongsTo,
  Column,
  CreatedAt,
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

  @BelongsTo(() => Timeslot)
  public timeslot?: Timeslot;

  @LazyGetter<Booking>((o) => o.timeslot, { shouldBePresent: true })
  public readonly lazyTimeslot!: Promise<Timeslot>;

  //public get lazyTimeslot(): Promise<Timeslot | undefined> {
  //  return (async () => {
  //    if (this.timeslot != null) {
  //      return this.timeslot;
  //    } else {
  //      return (await this.$get('timeslot')) as Timeslot | undefined;
  //    }
  //  })();
  //}

  // filled by sequelize
  @CreatedAt
  public readonly createdAt!: Date;

  public async timeTillDue(): Promise<Duration> {
    const timeslot = await this.lazyTimeslot;

    if (timeslot != null) {
      const currentDate = DateTime.local();
      const nextEndDate = await timeslot.getNextTimeslotEndDate();
      const interval = Interval.fromDateTimes(currentDate, nextEndDate);

      return interval.toDuration();
    } else {
      throw new Error('Could not retrieve timeslot.');
    }
  }

  public async hasPassed(): Promise<boolean> {
    const timeslot = await this.lazyTimeslot;

    if (timeslot != null) {
      return (
        moment(this.createdAt) <= (await timeslot.getPreviousTimeslotEndDate())
      );
    } else {
      throw new Error(
        'Can not retrieve timeslot. Did you ask Sequelize to include the Timeslot relationship when retrieving this Booking instance?'
      );
    }
  }
}
