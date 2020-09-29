import dbConfig from '../config/db.config';
import { Sequelize } from 'sequelize';
import {Timeslot, init as timeslotInit } from "./timeslots.model";
import {Weekday, init as weekdayInit} from "./weekday.model";
import {Booking, init as bookingInit} from "./booking.model";

const sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, dbConfig.sequelize_options);

type DbType = {
    sequelize: Sequelize,
    init: () => void
}

const db: DbType = {
    sequelize: sequelize,
    init: async () => {
        timeslotInit();
        weekdayInit();
        bookingInit();

        Timeslot.belongsTo(Weekday, {
            foreignKey: 'weekdayName',
            foreignKeyConstraint: true,
            targetKey: 'name',
            as: 'weekday',
            onDelete: 'cascade'
        });
        Weekday.hasMany(Timeslot, {
            foreignKey: 'weekdayName',
            sourceKey: 'name',
            as: 'timeslots',
            onDelete: 'cascade'
        });

        Booking.belongsTo(Timeslot, {
            foreignKey: 'id',
            foreignKeyConstraint: true,
            targetKey: 'id',
            as: 'timeslot',
            onDelete: 'cascade'
        })

        Timeslot.hasOne(Booking, {
            foreignKey: 'id',
            sourceKey: 'id',
            as: 'booking',
            onDelete: 'cascade'
        })

        try {
            await sequelize.sync();

            console.log("Synced DB.");
        }

        catch (error) {
            console.error(error);
        }
    }
};

export default db;

