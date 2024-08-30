const odbc = require('odbc');
const adodb = require('node-adodb');
const { databaseConnectionString } = require('./config');

/*let connection;
async function connect() {
  if (!connection) {
    connection = await odbc.connect(databaseConnectionString);
  }
  return connection;
}
  */

const DB = process.env.DATABASE_CONNECTION_STRING;
const connection = adodb.open(DB);

try{
  if(connection){
  }
}catch(error){
  console.log('Error en la conexión a la base de datos:', error)
}


module.exports =  connection ;
