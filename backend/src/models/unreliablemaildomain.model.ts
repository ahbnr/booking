import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table
export class UnreliableMailDomain extends BaseModel<UnreliableMailDomain> {
  @PrimaryKey
  @Column({ allowNull: false })
  public domain!: string;
}
