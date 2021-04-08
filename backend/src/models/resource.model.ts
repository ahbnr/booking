import { NotEmpty } from 'sequelize-typescript';
import { Column, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { Weekday } from './weekday.model';
import { BaseModel } from './BaseModel';
import { LazyGetter } from '../utils/LazyGetter';

@Table
export class Resource extends BaseModel<Resource> {
  @PrimaryKey
  @NotEmpty
  @Column({
    onDelete: 'CASCADE',
  })
  public name!: string;

  @HasMany(() => Weekday, { onDelete: 'CASCADE' })
  public weekdays!: Weekday[];

  @LazyGetter<Resource>((o) => o.weekdays, { convertNullToEmptyArray: true })
  public lazyWeekdays!: Promise<Weekday[]>;
}
