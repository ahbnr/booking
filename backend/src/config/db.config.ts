import { ModelMatch, SequelizeOptions } from 'sequelize-typescript';
import fs from 'fs';

const models = [__dirname + '/../models/**/*.model.@(ts|js)'];
const modelMatch: ModelMatch = (filename, member) => {
  return (
    filename.substring(0, filename.indexOf('.model')) === member.toLowerCase()
  );
};

export function getSequelizeOptions(): SequelizeOptions {
  const raw_file_contents = fs.readFileSync('db_config.js');
  const db_config = eval(raw_file_contents.toString()) as Record<
    string,
    SequelizeOptions
  >;

  const env = process.env.NODE_ENV || 'development';
  const sequelize_base_options = db_config[env];

  return {
    ...sequelize_base_options,
    models,
    modelMatch,
  };
}
