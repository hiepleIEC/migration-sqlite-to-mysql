const mysql = require('mysql');
const util = require('util');
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
}
const connection = mysql.createConnection(config);
const query = util.promisify(connection.query).bind(connection);
module.exports = query;