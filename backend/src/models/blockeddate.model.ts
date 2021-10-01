import { IsDate } from 'sequelize-typescript';
import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table
export class BlockedDate extends BaseModel<BlockedDate> {
  @PrimaryKey
  @IsDate
  @Column({ allowNull: false })
  public date!: Date;
}
