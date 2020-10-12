import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Weekday } from './weekday.model';
import moment from 'moment';
import {
  getNextWeekdayDate,
  getPreviousWeekdayDate,
  weekdayToInt,
} from '../utils/date';
import { Booking } from './booking.model';
import { DateTime, Duration } from 'luxon';
import { LazyGetter } from '../utils/LazyGetter';
import { BaseModel } from './BaseModel';

@Table
export class Timeslot extends BaseModel<Timeslot> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Weekday)
  @Column({ allowNull: false })
  public weekdayId!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  public startHours!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  public startMinutes!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  public endHours!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  public endMinutes!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  public capacity!: number;

  @HasMany(() => Booking, { onDelete: 'CASCADE' })
  public bookings?: Booking[];

  @LazyGetter<Timeslot>((o) => o.bookings, { convertNullToEmptyArray: true })
  public readonly lazyBookings!: Promise<Booking[]>;

  @BelongsTo(() => Weekday)
  public weekday?: Weekday;

  @LazyGetter<Timeslot>((o) => o.weekday, { shouldBePresent: true })
  public readonly lazyWeekday!: Promise<Weekday>;

  public async getPreviousTimeslotEndDate(): Promise<moment.Moment> {
    const weekday = await this.lazyWeekday;
    const previousDate = getPreviousWeekdayDate(weekday.name);

    return previousDate
      .add(this.endHours, 'hours')
      .add(this.endMinutes, 'minutes');
  }

  public async getNextTimeslotEndDate(): Promise<DateTime> {
    const weekday = await this.lazyWeekday;

    let nextWeekdayData = getNextWeekdayDate(weekday.name);

    // is it today?
    if (nextWeekdayData.weekday === weekdayToInt(weekday.name)) {
      const now = DateTime.local();

      if (
        now.hour >= this.endHours ||
        (now.hour === this.endHours && now.minute >= this.endMinutes)
      ) {
        nextWeekdayData = nextWeekdayData.plus(
          Duration.fromObject({ weeks: 1 })
        );
      }
    }

    return nextWeekdayData.plus(
      Duration.fromObject({
        hours: this.endHours,
        minutes: this.endMinutes,
      })
    );
  }
}
