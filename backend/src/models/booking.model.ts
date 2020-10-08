import { DataType, IsEmail, Model } from 'sequelize-typescript';
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
import { EMail, NonEmptyString, validateJson } from '../utils/typechecking';
import * as t from 'io-ts';
import { DateTime, Duration, Interval } from 'luxon';

// All booking post/update requests must conform to this interface
export const BookingInterface = t.type({
  name: NonEmptyString,
  email: EMail,
});

export type BookingInterface = t.TypeOf<typeof BookingInterface>;

export const BookingPostInterface = t.type({
  ...BookingInterface.props,
  lookupUrl: t.string,
});

export type BookingPostInterface = t.TypeOf<typeof BookingPostInterface>;

@Table
export class Booking extends Model<Booking> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Timeslot)
  @Column
  public timeslotId!: number;

  @Column
  public name!: string;

  @IsEmail
  @Column
  public email!: string;

  @BelongsTo(() => Timeslot)
  public timeslot?: Timeslot;

  public get lazyTimeslot(): Promise<Timeslot | undefined> {
    return (async () => {
      if (this.timeslot != null) {
        return this.timeslot;
      } else {
        return (await this.$get('timeslot')) as Timeslot | undefined;
      }
    })();
  }

  // filled by sequelize
  @CreatedAt
  public readonly createdAt!: Date;

  public async timeTillDue(): Promise<Duration> {
    const timeslot = await this.lazyTimeslot;

    if (timeslot != null) {
      const nextEndDate = timeslot.getNextTimeslotEndDate();

      return Interval.fromDateTimes(DateTime.local(), nextEndDate).toDuration();
    } else {
      throw new Error('Could not retrieve timeslot.');
    }
  }

  public async hasPassed(): Promise<boolean> {
    const timeslot = await this.lazyTimeslot;

    if (timeslot != null) {
      return moment(this.createdAt) <= timeslot.getPreviousTimeslotEndDate();
    } else {
      throw new Error(
        'Can not retrieve timeslot. Did you ask Sequelize to include the Timeslot relationship when retrieving this Booking instance?'
      );
    }
  }
}
