import { DataType, ForeignKey, BelongsTo, IsIn } from 'sequelize-typescript';
import { Timeslot } from './timeslot.model';
import { Column, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { Resource } from './resource.model';
import { WeekdayName, WeekdayNameValues } from 'common/dist';
import { BaseModel } from './BaseModel';
import { LazyGetter } from '../utils/LazyGetter';
import { Booking } from './booking.model';

@Table
export class Weekday extends BaseModel<Weekday> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @IsIn([WeekdayNameValues])
  @Column({
    type: DataType.STRING(10),
    onDelete: 'CASCADE',
    allowNull: false,
  })
  public name!: WeekdayName;

  @ForeignKey(() => Resource)
  @Column({ allowNull: false })
  public resourceName!: string;

  @BelongsTo(() => Resource, { onDelete: 'CASCADE' })
  public resource?: Resource;

  @HasMany(() => Timeslot, { onDelete: 'CASCADE' })
  public timeslots!: Timeslot[];

  @LazyGetter<Weekday>((o) => o.timeslots, { convertNullToEmptyArray: true })
  public readonly lazyTimeslots!: Promise<Timeslot[]>;
}
