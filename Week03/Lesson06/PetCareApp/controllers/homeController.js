// *changes: home page handler moved here from app.js (GET /)
// Index Page
exports.index = (req, res) => {
  res.render('index', { session: req.session });
};
