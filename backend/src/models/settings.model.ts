import { DataType, NotEmpty } from 'sequelize-typescript';
import { Column, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { Weekday } from './weekday.model';
import { BaseModel } from './BaseModel';
import { LazyGetter } from '../utils/LazyGetter';

@Table
export class Settings extends BaseModel<Settings> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public id!: number;

  // You may want to restrict users from booking a slot just a few hours before the target day
  // This setting defines the duration in milliseconds before a booking day until which booking is possible.
  @NotEmpty
  @Column({ defaultValue: 0 })
  public bookingDeadlineMillis!: number;
}
