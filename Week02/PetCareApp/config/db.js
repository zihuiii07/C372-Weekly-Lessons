// *changes: moved MySQL connection out of app.js into config/db.js, exported so models can use it
// MySQL Connection
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'NewPass123',
  database: 'petcare'
});

module.exports = connection;
