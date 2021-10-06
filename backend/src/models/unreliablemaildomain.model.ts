import { Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table
export class UnreliableMailDomain extends BaseModel<UnreliableMailDomain> {
  @PrimaryKey
  @Column({ type: DataType.STRING(253), allowNull: false })
  public domain!: string;
}
