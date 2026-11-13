// Pet Care Journal System
// *changes: app.js now only does setup - middleware, mounting the routers and starting the server
// all routes, SQL, multer, hashing and auth checks moved into routes/, controllers/, models/, config/, helpers/, middleware/
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const PORT = 3000;

app.use(flash());

// View Engine and Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: true
}));

// =========================
// Routers
// =========================
// *changes: each feature has its own router now (same URLs as before)
app.use(require('./routes/authRoutes'));
app.use(require('./routes/homeRoutes'));
app.use(require('./routes/adminRoutes'));
app.use(require('./routes/petRoutes'));
app.use(require('./routes/journalRoutes'));
app.use(require('./routes/paymentRoutes')); // *changes: L5 - added prepare payment route

// =========================
// Start Server
// =========================
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
