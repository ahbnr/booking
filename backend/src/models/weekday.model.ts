import {Sequelize, Model, DataTypes} from 'sequelize';
import db from './'
import {Timeslot, TimeslotInterface} from "./timeslots.model";

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

export class Weekday extends Model {
    public name!: WeekdayName;

    public timeslots!: Timeslot[];
}

export const init = () =>
    Weekday.init(
        {
            name: {
                type: new DataTypes.STRING(10),
                allowNull: false,
                primaryKey: true
            }
        },
        {
            tableName: 'weekdays',
            sequelize: db.sequelize
        }
    );

