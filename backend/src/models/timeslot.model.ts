import { BelongsTo, DataType, HasMany, Model } from 'sequelize-typescript';
import { Weekday, WeekdayName } from './weekday.model';
import moment from 'moment';
import { getPreviousWeekdayDate } from '../utils/date';
import { Booking } from './booking.model';
import { Column, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';
import { hasProperty } from '../utils/typechecking';

// All timeslot post/update requests must conform to this interface
export interface TimeslotInterface {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  capacity: number;
}

// FIXME: Use JSON schema instead of these functions
export function isTimeslotInterface(
  maybeTimeslotInterface: unknown
): maybeTimeslotInterface is TimeslotInterface {
  return (
    typeof maybeTimeslotInterface === 'object' &&
    maybeTimeslotInterface != null &&
    hasProperty(maybeTimeslotInterface, 'startHours') &&
    isHours(maybeTimeslotInterface.startHours) &&
    hasProperty(maybeTimeslotInterface, 'startMinutes') &&
    isMinutes(maybeTimeslotInterface.startMinutes) &&
    hasProperty(maybeTimeslotInterface, 'endHours') &&
    isHours(maybeTimeslotInterface.endHours) &&
    hasProperty(maybeTimeslotInterface, 'endMinutes') &&
    isMinutes(maybeTimeslotInterface.endMinutes) &&
    hasProperty(maybeTimeslotInterface, 'capacity')
  );
}

function isHours(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < 24
  );
}

function isMinutes(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < 60
  );
}

@Table
export class Timeslot extends Model<Timeslot> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Weekday)
  @Column
  public weekdayId!: number;

  @Column(DataType.INTEGER)
  public startHours!: number;

  @Column(DataType.INTEGER)
  public startMinutes!: number;

  @Column(DataType.INTEGER)
  public endHours!: number;

  @Column(DataType.INTEGER)
  public endMinutes!: number;

  @Column(DataType.INTEGER)
  public capacity!: number;

  @HasMany(() => Booking, { onDelete: 'CASCADE' })
  public bookings?: Booking[];

  @BelongsTo(() => Weekday)
  public weekday?: Weekday;

  public getPreviousTimeslotEndDate(): moment.Moment {
    const previousDate = getPreviousWeekdayDate(this.weekdayName);

    return previousDate
      .add(this.endHours, 'hours')
      .add(this.endMinutes, 'minutes');
  }
}
