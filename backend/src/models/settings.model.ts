import { DataType, NotEmpty } from 'sequelize-typescript';
import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

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

  // How many weeks ahead may users create bookings? Select -1 for unlimited
  @NotEmpty
  @Column({ defaultValue: -1 })
  public maxBookingWeekDistance!: number;
}
