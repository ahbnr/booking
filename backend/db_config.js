require('dotenv').config();

/**
 * Want to load secrets / passwords from environment variables?
 * Do it like this:
 *https://www.npmjs.com/package/dotenv
 * ```
 * {
 *   ...
 *   "password": process.env.DB_PASSWORD,
 *   ...
 * }
 * ```
 *
 * Make sure `dotenv` is loaded via `require('dotenv').config();`:
 * https://www.npmjs.com/package/dotenv
 */

module.exports = {
  development: {
    username: 'booking',
    password: 'password',
    database: 'bookingdb',
    dialect: 'sqlite',
    storage: 'memory',
  },
  production: {
    username: process.env.DB_PROD_USERNAME || 'booking',
    password: process.env.DB_PROD_PASSWORD || 'password',
    database: process.env.DB_PROD_DBNAME || 'bookingdb',
    host: process.env.DB_PROD_HOST || 'localhost',
    dialect: process.env.DB_PROD_DIALECT || 'mariadb',
    storage: process.env.DB_PROD_STORAGE || undefined,
  },
};
