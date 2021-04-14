import { ModelMatch, SequelizeOptions } from 'sequelize-typescript';

type DbConfigType = {
  db: string;
  user: string;
  password: string;
  sequelize_options: SequelizeOptions;
};

const models = [__dirname + '/../models/**/*.model.@(ts|js)'];
const modelMatch: ModelMatch = (filename, member) => {
  return (
    filename.substring(0, filename.indexOf('.model')) === member.toLowerCase()
  );
};

const debug_sequelize_options: SequelizeOptions = {
  dialect: 'sqlite',
  storage: 'memory',
  models: models,
  modelMatch: modelMatch,
};

/* eslint-disable */
// noinspection JSUnusedLocalSymbols
const production_sequelize_options: SequelizeOptions = {
  /* eslint-enable */
  host: 'localhost',
  dialect: 'mariadb',
  models: models,
  modelMatch: modelMatch,
};

export const dbConfig: DbConfigType = {
  db: 'bookingdb',
  user: 'booking_backend',
  password: 'password',
  sequelize_options: debug_sequelize_options,
};

export default dbConfig;
