import dbConfig from '../config/db.config';
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize(
    dbConfig.db,
    dbConfig.user,
    dbConfig.password,
    dbConfig.sequelize_options,
);

type DbType = {
    sequelize: Sequelize,
    init: () => void
}

const db: DbType = {
    sequelize: sequelize,
    init: async () => {
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
