const mysql = require('mysql');
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
}
const connection = mysql.createConnection(config);
connection.connect((err) => {
  if (err) {
    console.log("Error occurred", err);
  } else {
    console.log("Connected to database");
    connection.query(sql, function (err, result) {
      if (err) {
        console.log(err);
      }
      console.log("New table created");
    });
  }
});

module.exports = connection;