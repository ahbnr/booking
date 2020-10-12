"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const models = [__dirname + '/../models/**/*.model.ts'];
const modelMatch = (filename, member) => {
    return (filename.substring(0, filename.indexOf('.model')) === member.toLowerCase());
};
const debug_sequelize_options = {
    dialect: 'sqlite',
    storage: 'memory',
    models: models,
    modelMatch: modelMatch,
};
/* eslint-disable */
// noinspection JSUnusedLocalSymbols
const production_sequelize_options = {
    /* eslint-enable */
    host: 'localhost',
    dialect: 'mariadb',
    models: models,
    modelMatch: modelMatch,
};
exports.dbConfig = {
    db: 'bookingdb',
    user: 'booking_backend',
    password: 'password',
    sequelize_options: debug_sequelize_options,
};
exports.default = exports.dbConfig;
