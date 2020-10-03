import {BelongsTo, DataType, HasMany, Model} from "sequelize-typescript";
import {isWeekdayName, Weekday, WeekdayName} from "./weekday.model";
import moment from 'moment';
import {getPreviousWeekdayDate} from "../utils/date";
import {Booking} from "./booking.model";
import {Column, ForeignKey, HasOne, PrimaryKey, Table} from "sequelize-typescript";

// All timeslot post/update requests must conform to this interface
export interface TimeslotInterface {
    startHours: number;
    startMinutes: number;
    endHours: number;
    endMinutes: number;
    capacity: number;
}

export function isTimeslotInterface(maybeTimeslotInterface: any): maybeTimeslotInterface is TimeslotInterface {
    return 'startHours' in maybeTimeslotInterface
        && isHours(maybeTimeslotInterface.startHours)
        && 'startMinutes' in maybeTimeslotInterface
        && isMinutes(maybeTimeslotInterface.startMinutes)
        && 'endHours' in maybeTimeslotInterface
        && isHours(maybeTimeslotInterface.endHours)
        && 'endMinutes' in maybeTimeslotInterface
        && isMinutes(maybeTimeslotInterface.endMinutes)
        && 'capacity' in maybeTimeslotInterface;
}

function isHours(value: any): boolean {
    return Number.isInteger(value) && value >= 0 && value < 24;
}

function isMinutes(value: any): boolean {
    return Number.isInteger(value) && value >= 0 && value < 60;
}

@Table
export class Timeslot extends Model<Timeslot> {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        onDelete: 'CASCADE',
        autoIncrement: true,
        allowNull: false
    })
    public id!: number;

    @ForeignKey(() => Weekday)
    @Column(DataType.STRING(10))
    public weekdayName!: WeekdayName;

    @Column(DataType.INTEGER)
    public startHours!: number;

    @Column(DataType.INTEGER)
    public startMinutes!: number;

    @Column(DataType.INTEGER)
    public endHours!: number;

    @Column(DataType.INTEGER)
    public endMinutes!: number;

    @Column(DataType.INTEGER)
    public capacity!: number;

    @HasMany(() => Booking,  {onDelete: 'CASCADE'})
    public bookings?: Booking[];

    @BelongsTo(() => Weekday)
    public weekday?: Weekday;

    public getPreviousTimeslotEndDate(): moment.Moment {
        const previousDate = getPreviousWeekdayDate(this.weekdayName);

        return previousDate
            .add(this.endHours, 'hours')
            .add(this.endMinutes, 'minutes');
    }
}
