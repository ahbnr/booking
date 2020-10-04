import { Model } from 'sequelize-typescript';
import { Column, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { Weekday } from './weekday.model';

// All weekday post/update requests must conform to this interface
export interface ResourceInterface {}

export function isResourceInterface(
  maybeWeekdayInterface: unknown
): maybeWeekdayInterface is ResourceInterface {
  return true;
}

@Table
export class Resource extends Model<Resource> {
  @PrimaryKey
  @Column
  public name!: string;

  @HasMany(() => Weekday, { onDelete: 'CASCADE' })
  public weekdays!: Weekday[];
}
