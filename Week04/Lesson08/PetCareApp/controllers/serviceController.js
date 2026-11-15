// *changes: new file (L8) - service booking pages: GET /services, POST /services/book, GET /bookings
// messages are the exact ones from specs/service-booking.md section 7
const petModel = require('../models/petModel');
const serviceModel = require('../models/serviceModel');
const serviceBookingModel = require('../models/serviceBookingModel');

// today's date on this computer (local time, not UTC) as YYYY-MM-DD
function getLocalToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// "5" ok; "", "0", "-1", "1.5", "abc" not ok
function isPositiveInteger(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return false;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0;
}

// must be YYYY-MM-DD, a real calendar date (no 2026-02-30), and today or later
function isValidBookingDate(value, today) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const isRealDate = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  if (!isRealDate) return false;
  return value >= today; // same format, so comparing the strings compares the dates
}

// Service list + booking form
exports.listServices = (req, res) => {
  const userId = req.session.user.id;

  petModel.getPetsByOwner(userId, (err, pets) => {
    if (err) {
      console.error('Error loading pets:', err);
      return res.status(500).send('Unable to load pets.');
    }

    serviceModel.getActiveServices((err2, services) => {
      if (err2) {
        console.error('Error loading services:', err2);
        return res.status(500).send('Unable to load services.');
      }

      // only preselect the pet if it is one of this user's pets
      const requestedPetId = req.query.petId;
      let selectedPetId = '';
      if (requestedPetId && pets.some(p => String(p.id) === String(requestedPetId))) {
        selectedPetId = String(requestedPetId);
      }

      res.render('services', {
        pets,
        services,
        selectedPetId,
        today: getLocalToday(),
        messages: req.flash('success'),
        errors: req.flash('error'),
        session: req.session
      });
    });
  });
};

// Handle booking form
exports.createBooking = (req, res) => {
  const userId = req.session.user.id; // owner always from the session, never from the form
  const { petId, serviceId, bookingDate } = req.body || {};

  if (!isPositiveInteger(petId) || !isPositiveInteger(serviceId) || !isValidBookingDate(bookingDate, getLocalToday())) {
    req.flash('error', 'Choose a pet, service, and valid booking date.');
    return res.redirect('/services');
  }

  // no price is taken from the form - the model uses the database price
  serviceBookingModel.createPendingBooking(userId, Number(petId), Number(serviceId), bookingDate, (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      req.flash('error', 'Unable to create the booking. Please try again.');
      return res.redirect(`/services?petId=${encodeURIComponent(petId)}`);
    }

    if (!result) {
      req.flash('error', 'That pet or service is unavailable for booking.');
      return res.redirect('/services');
    }

    req.flash('success', 'Booking created. Payment is pending; no payment has been processed.');
    return res.redirect('/bookings');
  });
};

// Booking history
exports.listBookings = (req, res) => {
  const userId = req.session.user.id;

  serviceBookingModel.getBookingsByOwner(userId, (err, bookings) => {
    if (err) {
      console.error('Error loading booking history:', err);
      return res.status(500).send('Unable to load booking history.');
    }

    res.render('bookings', {
      bookings,
      messages: req.flash('success'),
      errors: req.flash('error'),
      session: req.session
    });
  });
};
