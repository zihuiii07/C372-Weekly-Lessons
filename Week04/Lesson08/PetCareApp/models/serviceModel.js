// *changes: new file (L8) - reads the service catalogue from the database services table
// (the L5/L6 mock catalogue in data/mockServices.js is not used for booking)
const pool = require('../config/db');

// Active services only, ordered by name
function getActiveServices(callback) {
  const sql = 'SELECT id, name, price FROM services WHERE is_active = 1 ORDER BY name';
  pool.query(sql, callback);
}

module.exports = { getActiveServices };
