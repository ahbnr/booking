import { NotEmpty } from 'sequelize-typescript';
import { Column, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { Weekday } from './weekday.model';
import { BaseModel } from './BaseModel';

@Table
export class Resource extends BaseModel<Resource> {
  @PrimaryKey
  @NotEmpty
  @Column
  public name!: string;

  @HasMany(() => Weekday, { onDelete: 'CASCADE' })
  public weekdays!: Weekday[];
}
