import {DataTypes, Model} from "sequelize";
import db from "./index";
import {Timeslot} from "./timeslots.model";
import moment from 'moment';

// All booking post/update requests must conform to this interface
export interface BookingInterface {
    timeslotId: number;
    name: string;
}

export function isBookingInterface(maybeBookingInterface: any): maybeBookingInterface is BookingInterface {
    return 'timeslotId' in maybeBookingInterface
        && Number.isInteger(maybeBookingInterface.timeslotId)
        && 'name' in maybeBookingInterface
        && maybeBookingInterface.name != null && maybeBookingInterface.name !== ''
}

export class Booking extends Model {
    public id!: number;
    public timeslotId!: number;
    public name!: string;

    public timeslot!: Timeslot;

    // filled by sequelize
    public readonly createdAt!: Date;

    public hasPassed(): boolean {
        return this.timeslot.getPreviousTimeslotEndDate() < moment(this.createdAt);
    }
}

export const init = () =>
    Booking.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            timeslotId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            name: {
                type: new DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: 'bookings',
            sequelize: db.sequelize
        }
    );
