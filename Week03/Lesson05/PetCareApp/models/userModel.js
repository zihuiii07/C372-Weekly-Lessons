// *changes: new user model - SQL for sign up, login and the admin user pages moved here from the app.js routes
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

// Admin: list all users
// *changes: moved from GET /admin/users in app.js
function getAllUsers(callback) {
  const sql = 'SELECT id, name, username, role FROM users';
  connection.query(sql, callback);
}

// Admin: get one user
// *changes: moved from GET /admin/users/:id in app.js
function getUserById(userId, callback) {
  const sql = 'SELECT id, name, username, role FROM users WHERE id = ?';
  connection.query(sql, [userId], callback);
}

// Admin: delete user
// *changes: moved from GET /admin/users/delete/:id in app.js
function deleteUser(userId, callback) {
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [userId], callback);
}

module.exports = { createUser, findByCredentials, getAllUsers, getUserById, deleteUser };
