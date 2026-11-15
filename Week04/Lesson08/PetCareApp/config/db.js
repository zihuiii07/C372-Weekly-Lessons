// *changes: moved MySQL connection out of app.js into config/db.js, exported so models can use it
// *changes: L8 - changed from createConnection to createPool. The booking transaction needs its own
// connection from the pool (implementation spec section 6). pool.query works the same way, so the
// existing user/pet/journal models did not need to change.
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'NewPass123',
  database: 'petcare',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
