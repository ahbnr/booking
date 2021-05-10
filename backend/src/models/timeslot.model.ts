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
import { Booking } from './booking.model';
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

  @HasMany(() => Booking, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public bookings?: Booking[];

  @LazyGetter<Timeslot>((o) => o.bookings, { convertNullToEmptyArray: true })
  public readonly lazyBookings!: Promise<Booking[]>;

  @BelongsTo(() => Weekday, { onDelete: 'CASCADE' })
  public weekday?: Weekday;

  @LazyGetter<Timeslot>((o) => o.weekday, { shouldBePresent: true })
  public readonly lazyWeekday!: Promise<Weekday>;
}
