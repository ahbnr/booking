import { Options } from 'sequelize';

type DbConfigType = {
    db: string,
    user: string,
    password: string,
    sequelize_options: Options
};

export const dbConfig: DbConfigType = {
    db: "bookingdb",
    user: "booking_backend",
    password: "password",
    sequelize_options: {
        host: "localhost",
        dialect: "mysql",
    }
};

export default dbConfig;