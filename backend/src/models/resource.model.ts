import { DataType, NotEmpty } from 'sequelize-typescript';
import { Column, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { Weekday } from './weekday.model';
import { BaseModel } from './BaseModel';
import { LazyGetter } from '../utils/LazyGetter';

export const MAX_RESOURCE_NAME_LENGTH = 64;

@Table
export class Resource extends BaseModel<Resource> {
  @PrimaryKey
  @NotEmpty
  @Column({
    type: DataType.STRING(MAX_RESOURCE_NAME_LENGTH),
    onDelete: 'CASCADE',
  })
  public name!: string;

  @HasMany(() => Weekday, { onDelete: 'CASCADE' })
  public weekdays!: Weekday[];

  @LazyGetter<Resource>((o) => o.weekdays, { convertNullToEmptyArray: true })
  public lazyWeekdays!: Promise<Weekday[]>;
}
