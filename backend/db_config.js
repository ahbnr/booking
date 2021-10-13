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
    username: 'booking',
    password: 'password',
    database: 'bookingdb',
    host: 'localhost',
    dialect: 'mariadb',
  },
};
