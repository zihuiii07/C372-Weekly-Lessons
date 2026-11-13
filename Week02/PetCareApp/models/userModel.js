// *changes: new user model - SQL for sign up and login moved here from the app.js routes
const connection = require('../config/db');

// Sign up: create a new user
function createUser(username, hashedPassword, name, role, callback) {
  const sql = 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)';
  connection.query(sql, [username, hashedPassword, name, role], callback);
}

// Login: find user by username + hashed password
function findByCredentials(username, hashedPassword, callback) {
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, hashedPassword], callback);
}

module.exports = { createUser, findByCredentials };
