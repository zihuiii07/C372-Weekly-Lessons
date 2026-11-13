// *changes: moved sha256Hash out of app.js into helpers/hash.js (still SHA-256, no change in hashing)
const crypto = require('crypto');

function sha256Hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { sha256Hash };
