import {DataTypes, Model} from "sequelize";
import db from "./index";
import {isWeekdayName, Weekday, WeekdayName} from "./weekday.model";
import moment from 'moment';
import {getPreviousWeekdayDate} from "../utils/date";
import {Booking} from "./booking.model";

// All timeslot post/update requests must conform to this interface
export interface TimeslotInterface {
    weekdayName: WeekdayName;
    startHours: number;
    startMinutes: number;
    endHours: number;
    endMinutes: number;
}

export function isTimeslotInterface(maybeTimeslotInterface: any): maybeTimeslotInterface is TimeslotInterface {
    return   'weekdayName' in maybeTimeslotInterface
        && isWeekdayName(maybeTimeslotInterface.weekdayName)
        && 'startHours' in maybeTimeslotInterface
        && isHours(maybeTimeslotInterface.startHours)
        && 'startMinutes' in maybeTimeslotInterface
        && isMinutes(maybeTimeslotInterface.startMinutes)
        && 'endHours' in maybeTimeslotInterface
        && isHours(maybeTimeslotInterface.endHours)
        && 'endMinutes' in maybeTimeslotInterface
        && isMinutes(maybeTimeslotInterface.endMinutes);
}

function isHours(value: any): boolean {
    return Number.isInteger(value) && value >= 0 && value < 24;
}

function isMinutes(value: any): boolean {
    return Number.isInteger(value) && value >= 0 && value < 60;
}

export class Timeslot extends Model {
    public id!: number;
    public weekdayName!: WeekdayName;

    public startHours!: number;
    public startMinutes!: number;
    public endHours!: number;
    public endMinutes!: number;

    public booking?: Booking;

    public getPreviousTimeslotEndDate(): moment.Moment {
        const previousDate = getPreviousWeekdayDate(this.weekdayName);

        return previousDate
            .add(this.endHours, 'hours')
            .add(this.endMinutes, 'minutes');
    }
}

export const init = () =>
    Timeslot.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            weekdayName: {
                type: new DataTypes.STRING(10),
                allowNull: false,
            },
            startHours: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            startMinutes: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            endHours: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            endMinutes: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
        },
        {
            tableName: 'timeslots',
            sequelize: db.sequelize
        }
    );

