import { Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Timeslot } from './timeslot.model';
import { Column, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { Resource } from './resource.model';
import { hasProperty } from '../utils/typechecking';

export type WeekdayName =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';
export function isWeekdayName(
  maybeWeekdayName: string
): maybeWeekdayName is WeekdayName {
  return (
    maybeWeekdayName === 'monday' ||
    maybeWeekdayName === 'tuesday' ||
    maybeWeekdayName === 'wednesday' ||
    maybeWeekdayName === 'thursday' ||
    maybeWeekdayName === 'friday' ||
    maybeWeekdayName === 'saturday' ||
    maybeWeekdayName === 'sunday'
  );
}

// All weekday post/update requests must conform to this interface
export interface WeekdayInterface {
  name: string;
}

export function isWeekdayInterface(
  maybeWeekdayInterface: unknown
): maybeWeekdayInterface is WeekdayInterface {
  return (
    typeof maybeWeekdayInterface === 'object' &&
    maybeWeekdayInterface != null &&
    hasProperty(maybeWeekdayInterface, 'name') &&
    typeof maybeWeekdayInterface.name === 'string' &&
    isWeekdayName(maybeWeekdayInterface.name)
  );
}

@Table
export class Weekday extends Model<Weekday> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @Column({
    type: DataType.STRING(10),
    onDelete: 'CASCADE',
    allowNull: false,
  })
  public name!: WeekdayName;

  @ForeignKey(() => Resource)
  @Column
  public resourceName!: string;

  @BelongsTo(() => Resource)
  public resource?: Resource;

  @HasMany(() => Timeslot, { onDelete: 'CASCADE' })
  public timeslots!: Timeslot[];
}
