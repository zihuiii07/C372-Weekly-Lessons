// *changes: new pet model - pet INSERT moved here from the sign up route in app.js
const connection = require('../config/db');

// Add a pet for an owner
function createPet(ownerId, name, species, breed, age, image, callback) {
  const sql = 'INSERT INTO pets (owner_id, name, species, breed, age, image ) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [ownerId, name, species, breed, age, image], callback);
}

module.exports = { createPet };
