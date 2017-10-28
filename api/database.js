let promise = require('bluebird');

let options = {
  // Initialization Options
  promiseLib: promise
};

const databaseURL = require('./config.json');

let pgp = require('pg-promise')(options);
let connectionString = (
  (process.env.NODE_ENV === 'test') ?
    databaseURL.database.test
  :
    databaseURL.database.dev
);

let db = pgp(connectionString);

module.exports = { db, pgp };
