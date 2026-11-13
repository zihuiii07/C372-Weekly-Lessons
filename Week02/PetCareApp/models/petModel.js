// *changes: new pet model - pet SQL moved here from the sign up, add pet and journal routes in app.js
const connection = require('../config/db');

// Add a pet for an owner
function createPet(ownerId, name, species, breed, age, image, callback) {
  const sql = 'INSERT INTO pets (owner_id, name, species, breed, age, image ) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [ownerId, name, species, breed, age, image], callback);
}

// Get all pets of an owner
// *changes: same query was repeated in admin user details, journals list, new/edit journal and search - now one function
function getPetsByOwner(ownerId, callback) {
  const sql = 'SELECT * FROM pets WHERE owner_id = ?';
  connection.query(sql, [ownerId], callback);
}

module.exports = { createPet, getPetsByOwner };
