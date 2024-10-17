const odbc = require('odbc');
const { databaseConnectionString } = require('./config');

let connection;

async function connect() {
  if (!connection) {
    connection = await odbc.connect(databaseConnectionString);
  }
  return connection;
}

module.exports = connect;
