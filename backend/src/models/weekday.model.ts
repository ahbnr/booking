import {Model, DataType} from 'sequelize-typescript';
import {Timeslot} from "./timeslot.model";
import {Column, HasMany, PrimaryKey, Table} from "sequelize-typescript";

export type WeekdayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export function isWeekdayName(maybeWeekdayName: string): maybeWeekdayName is WeekdayName {
    return maybeWeekdayName === 'monday'
        || maybeWeekdayName === 'tuesday'
        || maybeWeekdayName === 'wednesday'
        || maybeWeekdayName === 'thursday'
        || maybeWeekdayName === 'friday'
        || maybeWeekdayName === 'saturday'
        || maybeWeekdayName === 'sunday';
}

// All weekday post/update requests must conform to this interface
export interface WeekdayInterface { }

export function isWeekdayInterface(maybeWeekdayInterface: any): maybeWeekdayInterface is WeekdayInterface {
    return true;
}

@Table
export class Weekday extends Model<Weekday> {
    @PrimaryKey
    @Column({
        type: DataType.STRING(10),
        onDelete: 'CASCADE',
        allowNull: false
    })
    public name!: WeekdayName;

    @HasMany(() => Timeslot, {onDelete: 'CASCADE'})
    public timeslots!: Timeslot[];
}