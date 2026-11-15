// *changes: add pet form + submit handlers moved here from app.js
const petModel = require('../models/petModel');

// Add pet form
exports.showNewPet = (req, res) => {
  res.render('newPet', {session: req.session});
};

// Handle add pet
exports.createPet = (req, res) => {
  const { pet_name, species, breed, age } = req.body;
  let petImage;

  if (req.file) {
    petImage = req.file.filename; // use uploaded filename
  } else {
    petImage = null;
  }

  const ownerId = req.session.user.id;

  petModel.createPet(ownerId, pet_name, species, breed, age, petImage, (err) => {
    if (err) {
      console.error(err);
      return res.send('Failed to add pet.');
    }
    res.redirect('/journals');
  });
};
