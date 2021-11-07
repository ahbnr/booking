import { DataType, IsDate, NotEmpty } from 'sequelize-typescript';
import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table
export class BlockedDate extends BaseModel<BlockedDate> {
  @PrimaryKey
  @IsDate
  @Column({ allowNull: false })
  public date!: Date;

  @NotEmpty
  @Column({ type: DataType.STRING(256), allowNull: true, defaultValue: null })
  public note?: string;
}
