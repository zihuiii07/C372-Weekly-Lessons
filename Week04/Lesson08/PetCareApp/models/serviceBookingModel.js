// *changes: new file (L8) - booking + payment records
// createPendingBooking saves the booking and its payment in ONE transaction on one pool connection
// getBookingsByOwner returns the signed-in owner's booking history
const pool = require('../config/db');

// callback(null, { bookingId, paymentId })  -> both rows committed
// callback(null, null)                      -> pet not owned by this user, or service missing/inactive
// callback(err)                             -> database error (rolled back)
function createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
  pool.getConnection((err, conn) => {
    if (err) return callback(err);

    // make sure the callback only runs once and the connection is always released
    let finished = false;
    function finish(error, result) {
      if (finished) return;
      finished = true;
      conn.release();
      callback(error, result);
    }

    // undo everything, then report. A failed rollback is reported as an error, never as success
    function rollbackAndFinish(error, result) {
      conn.rollback((rollbackErr) => {
        if (error || rollbackErr) return finish(error || rollbackErr);
        finish(null, result);
      });
    }

    conn.beginTransaction((err) => {
      if (err) return finish(err);

      // only inserts a row if the pet belongs to this owner AND the service is active
      // booked_price comes from the services table, not from the form
      const bookingSql = `
        INSERT INTO service_bookings (pet_id, service_id, booking_status, booked_price, booking_date)
        SELECT p.id, s.id, 'pending', s.price, ?
        FROM pets p
        JOIN services s ON s.id = ? AND s.is_active = 1
        WHERE p.id = ? AND p.owner_id = ?`;

      conn.query(bookingSql, [bookingDate, serviceId, petId, ownerId], (err, bookingResult) => {
        if (err) return rollbackAndFinish(err);

        // nothing inserted = pet not owned or service unavailable
        if (bookingResult.affectedRows !== 1) return rollbackAndFinish(null, null);

        const bookingId = bookingResult.insertId;

        // payment amount copied from the booking's stored price
        const paymentSql = `
          INSERT INTO payments (booking_id, amount, payment_status)
          SELECT id, booked_price, 'pending'
          FROM service_bookings
          WHERE id = ?`;

        conn.query(paymentSql, [bookingId], (err, paymentResult) => {
          if (err) return rollbackAndFinish(err);
          if (paymentResult.affectedRows !== 1) {
            return rollbackAndFinish(new Error('Payment record was not created'));
          }

          conn.commit((err) => {
            if (err) return rollbackAndFinish(err);
            finish(null, { bookingId, paymentId: paymentResult.insertId });
          });
        });
      });
    });
  });
}

// Booking history for one owner, newest first
// LEFT JOIN payments so a booking without a payment row still shows
function getBookingsByOwner(ownerId, callback) {
  const sql = `
    SELECT b.id AS booking_id,
           DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
           p.name AS pet_name,
           s.name AS service_name,
           b.booked_price,
           b.booking_status,
           pay.payment_status,
           pay.payment_reference,
           b.created_at
    FROM service_bookings b
    JOIN pets p ON p.id = b.pet_id
    JOIN services s ON s.id = b.service_id
    LEFT JOIN payments pay ON pay.booking_id = b.id
    WHERE p.owner_id = ?
    ORDER BY b.created_at DESC, b.id DESC`;
  pool.query(sql, [ownerId], callback);
}

module.exports = { createPendingBooking, getBookingsByOwner };
