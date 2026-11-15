// *changes: /pets routes moved here from app.js
// kept the original middleware order on POST /pets (upload first, then isLoggedIn)
const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { isLoggedIn } = require('../middleware/auth');
const petController = require('../controllers/petController');

router.get('/pets/new', isLoggedIn, petController.showNewPet);
router.post('/pets', upload.single('pet_image'), isLoggedIn, petController.createPet);

module.exports = router;
