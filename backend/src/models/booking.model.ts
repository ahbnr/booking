import {DataType, Model} from "sequelize-typescript";
import {Timeslot} from "./timeslot.model";
import moment from 'moment';
import {BelongsTo, Column, CreatedAt, ForeignKey, PrimaryKey, Table} from "sequelize-typescript";
import RuntimeError = WebAssembly.RuntimeError;

// All booking post/update requests must conform to this interface
export interface BookingInterface {
    name: string;
}

export function isBookingInterface(maybeBookingInterface: any): maybeBookingInterface is BookingInterface {
    return 'name' in maybeBookingInterface
        && maybeBookingInterface.name != null && maybeBookingInterface.name !== ''
}

@Table
export class Booking extends Model<Booking> {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        onDelete: 'CASCADE',
        autoIncrement: true,
        allowNull: false
    })
    public id!: number;

    @ForeignKey(() => Timeslot)
    @Column
    public timeslotId!: number;

    @Column
    public name!: string;

    @BelongsTo(() => Timeslot)
    public timeslot?: Timeslot;

    public get lazyTimeslot(): Promise<Timeslot | undefined> {
        return (async () => {
            if (this.timeslot != null) {
                return this.timeslot;
            }

            else {
                return await this.$get('timeslot') as Timeslot | undefined;
            }
        })();
    }

    // filled by sequelize
    @CreatedAt
    public readonly createdAt!: Date;

    public async hasPassed(): Promise<boolean> {
        const timeslot = await this.lazyTimeslot;

        if (timeslot != null) {
            return moment(this.createdAt) <= timeslot.getPreviousTimeslotEndDate();
        }

        else {
            throw new Error('Can not retrieve timeslot. Did you ask Sequelize to include the Timeslot relationship when retrieving this Booking instance?');
        }
    }
}
