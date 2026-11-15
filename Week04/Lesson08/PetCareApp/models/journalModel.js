// *changes: new journal model - all journal SQL moved here from the app.js routes (same queries as before)
const connection = require('../config/db');

// Admin user details: all journals of a user's pets
function getJournalsByOwner(ownerId, callback) {
  const sql = `
    SELECT journal.*, pets.id AS pet_id
    FROM journal
    JOIN pets ON journal.pet_id = pets.id
    WHERE pets.owner_id = ?
  `;
  connection.query(sql, [ownerId], callback);
}

// Journals page: journals for one selected pet of the user
function getJournalsByOwnerAndPet(ownerId, petId, callback) {
  const sql = `
      SELECT journal.*, pets.name, pets.species, pets.breed, pets.age, pets.image 
      FROM journal 
      JOIN pets ON journal.pet_id = pets.id 
      WHERE pets.owner_id = ? AND pets.id = ?
    `;
  connection.query(sql, [ownerId, petId], callback);
}

// Add journal
function createJournal(petId, activity, notes, entryDate, callback) {
  const sql = 'INSERT INTO journal (pet_id, activity, notes, entry_date) VALUES (?, ?, ?, ?)';
  connection.query(sql, [petId, activity, notes, entryDate], callback);
}

// Get one journal (edit form)
function getJournalById(journalId, callback) {
  const sql = 'SELECT * FROM journal WHERE id = ?';
  connection.query(sql, [journalId], callback);
}

// Update journal
function updateJournal(journalId, entryDate, activity, notes, petId, callback) {
  const sql = 'UPDATE journal SET entry_date = ?, activity = ?, notes = ?, pet_id = ? WHERE id = ?';
  connection.query(sql, [entryDate, activity, notes, petId, journalId], callback);
}

// Find which pet a journal belongs to (used before delete so we can redirect back)
function getPetIdByJournalId(journalId, callback) {
  const sql = 'SELECT pet_id FROM journal WHERE id = ?';
  connection.query(sql, [journalId], callback);
}

// Delete journal
function deleteJournal(journalId, callback) {
  const sql = 'DELETE FROM journal WHERE id = ?';
  connection.query(sql, [journalId], callback);
}

// Search journals by activity or notes, optionally for one pet
function searchJournals(ownerId, searchQuery, selectedPetId, callback) {
  let sql = `
      SELECT journal.*, pets.name, pets.species, pets.breed, pets.age, pets.image 
      FROM journal 
      JOIN pets ON journal.pet_id = pets.id 
      WHERE pets.owner_id = ? AND (journal.activity LIKE ? OR journal.notes LIKE ?)`;

  const params = [ownerId, searchQuery, searchQuery];

  if (selectedPetId) {
    sql += ' AND pets.id = ?';
    params.push(selectedPetId);
  }

  connection.query(sql, params, callback);
}

module.exports = {
  getJournalsByOwner,
  getJournalsByOwnerAndPet,
  createJournal,
  getJournalById,
  updateJournal,
  getPetIdByJournalId,
  deleteJournal,
  searchJournals
};
