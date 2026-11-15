# C372 CA1 – change log

Rough notes of what was changed, kept while working. Used later for the AI journal.

## Week 2 – L3 MVC refactor (Fri 13 Nov)

Before starting:
- Week01 app was set up on the other laptop, so on this Mac MySQL kept saying "Access denied for user root". Reset the MySQL root password on this Mac (safe mode, --skip-grant-tables) to the same one as the other laptop so app.js works on both.
- Ran db.sql in Workbench to create the petcare database here.
- Copied Week01/PetCareApp into Week02/PetCareApp, committed as the starting point.

Gave Claude the L3 MVC refactoring spec as the prompt. It listed all the routes from app.js (first said 17, recounted later - actually 19), suggested the folder layout and a staged plan first. I checked the route list against my app.js and approved the plan. Kept the file names the same as the lecturer's Week02 repo (homeController / homeRoutes).

Things it pointed out but we left alone on purpose (spec says structure only, no fixes):
- /signup renders 'signup' but the file is signUp.ejs – works on Mac, would break on Linux.
- POST /pets runs the image upload before isLoggedIn, so the file is saved even if not logged in.

### Stage 1 – config, helpers, middleware
- config/db.js – MySQL connection moved here (only place the password is now).
- config/upload.js – multer storage moved here.
- helpers/hash.js – sha256Hash moved here, still SHA-256.
- middleware/auth.js – isLoggedIn and isAdmin moved here.

### Stage 2 – auth + home
- models/userModel.js – createUser (sign up insert), findByCredentials (login select).
- models/petModel.js – createPet (used by sign up).
- controllers/authController.js – showSignup, signup, showLogin, login, logout. Same flash messages, redirects and render variables as before.
- controllers/homeController.js – index.
- routes/authRoutes.js, routes/homeRoutes.js – just method + URL + middleware + controller.
- app.js – removed the auth/home routes and the old db/multer/hash/middleware code, now requires the new files and mounts the two routers. Admin, pet and journal routes still inside app.js for now.
- Checked: all files pass node --check.
- Added "// *changes:" comments at the top of each new file (and in app.js) saying what was moved where.
- Tested: home page, login (right + wrong password), logout, sign up with pet image. First test the pet image didn't show - turned out I didn't pick a file for that user (same broken icon as the original app). Signed up another user with an image and it showed. Committed.

### Stage 3 – admin
- models/userModel.js – added getAllUsers, getUserById, deleteUser.
- models/petModel.js – added getPetsByOwner. The same "SELECT * FROM pets WHERE owner_id = ?" was copied in 5 routes before, now all of them call this one function.
- models/journalModel.js – new, getJournalsByOwner for the admin user details page.
- controllers/adminController.js – dashboard, listUsers, userDetails, deleteUser. Kept the same res.send error text ("User not found", "Error deleting user" etc).
- routes/adminRoutes.js – 4 admin routes, each still has isAdmin.

### Stage 4 – pets
- controllers/petController.js – showNewPet, createPet.
- routes/petRoutes.js – GET /pets/new, POST /pets. Kept upload.single before isLoggedIn on POST /pets like the original.

### Stage 5 – journals
- models/journalModel.js – added list by pet, create, get by id, update, get pet_id (for redirect after delete), delete, search. Search still adds "AND pets.id = ?" only when a pet is selected.
- controllers/journalController.js – listJournals, showNewJournal, createJournal, showEditJournal, updateJournal, deleteJournal, searchJournals. Same ?petId= redirects and same variables passed to journals.ejs (journals, pets, selectedPetId, pet, session).
- routes/journalRoutes.js – 7 journal routes, all isLoggedIn.

### Stage 6 – clean up app.js
- app.js went from 487 lines to about 35. Only setup left: flash, ejs, urlencoded, static, session, mount 5 routers, listen.
- Removed the old commented-out code (old /admin/users join, /pets/:id, old /journals versions) since it wasn't being used.
- Middleware order kept the same as before (flash, view engine, urlencoded, static, session, then routes).
- Checked: all files pass node --check, app loads with all requires working, and compared the route list against the Week 2 starting app.js - same 19 method + URL pairs.
- Views, db.sql and the database not touched.

## Week 3 – L5 prepare payment spec + GET endpoint (Fri 13 Nov)

- Made Week03/Lesson05/PetCareApp as a copy of my Week02 app (no node_modules), added specs/prepare-payment.md with the scaffold from the slides.
- Wrote the first draft of the spec myself using the lesson scope table (services, price from server, JSON, 404 for unknown, no login, no real payment).
- Asked Claude to review the draft only (gaps + questions, no rewriting, no code). It came back with 6 points:
  1. AC1–AC3 didn't say which service ID to request – accepted, added "Service ID 1/2/3 →".
  2. Scope line "should not ... add pages or login" could be read as "don't add login" – accepted, reworded to "does not require login (classroom mock only)".
  3. Request section didn't say what the input is – accepted, added serviceId in the URL, no request body.
  4. Section 5 had curly quotes and didn't say currency/status are strings with fixed values – accepted, fixed quotes and added the example JSON.
  5. My open question about ?amount=1 clashed with section 3 (price never from client) – accepted, decided the client amount is ignored and moved it into section 3 (matches the L6 Postman price check, amount should stay 35).
  6. No rule for non-numeric IDs like /payments/prepare/abc – accepted as an open question only, not deciding it now.
- Accepted all 6, Claude applied only those changes. Checked the diff.
- Asked Claude for a file plan before any code (slides Exercise 4 prompt). Plan: data/mockServices.js, controllers/paymentController.js, routes/paymentRoutes.js, mount in app.js. No packages, DB, EJS or gateway. It flagged that /payments/prepare/abc will just give 404 because it isn't found – no extra validation added since the spec leaves it as an open question. Approved the plan.
- data/mockServices.js – catalogue array: 1 Vaccination 35, 2 Pet Grooming 50, 3 Boarding 80.
- controllers/paymentController.js – preparePayment: Number(serviceId), find in catalogue, 404 {"error":"Service not found"} if missing, else 200 with serviceId, serviceName, amount (from catalogue), currency "sgd", status "READY_FOR_PAYMENT". Exported as module.exports = { preparePayment } so L6 can add createMockPayment.
- routes/paymentRoutes.js – GET /payments/prepare/:serviceId, no isLoggedIn (spec says no login).
- app.js – one line added to mount paymentRoutes after the journal routes.
- Quick check by calling the controller directly: IDs 1/2/3 give 200 with 5 fields and 35/50/80, 999 gives 404, ?amount=1 still gives 35, abc gives 404.
- Tested in browser: /payments/prepare/1, 2, 3 show the right JSON, 999 shows {"error":"Service not found"}. The browser doesn't show the 404 number, only the JSON – can see it in DevTools > Network (or Postman in L6). ?amount=1 still 35. Login still works. Committed.

## Week 3 – L6 Postman + POST mock payment (Fri 13 Nov)

- Made Week03/Lesson06/PetCareApp as a copy of my Lesson05 app (Lesson05 left as is for reference).
- services/mockPaymentProvider.js – new, supplied code from the slides. Returns providerPaymentId 'mock_' + timestamp, the merchantReference, and status = testStatus or PENDING.
- controllers/paymentController.js – added the MockProvider require at the top, pasted createMockPayment from createMockPayment.txt after preparePayment, exports now { preparePayment, createMockPayment }. GET code not touched.
- routes/paymentRoutes.js – added POST /payments/mock/:serviceId under the GET route.
- app.js – added app.use(express.json()) before the routes so the JSON body (testStatus) can be read.
- Quick check calling the controller directly:
  MC1 /1 PENDING -> 200, AWAITING_PAYMENT
  MC2 /2 APPROVED -> 200, CONFIRMED
  MC3 /3 DECLINED -> 200, PAYMENT_FAILED
  MC4 /999 -> 404 Service not found
  MC5 /2 with {} -> defaults to PENDING, AWAITING_PAYMENT
  GET /payments/prepare/1 still the same 5 fields.
- Noticed (not changed, it's supplied code): if testStatus is something not in the map, e.g. "FOO", bookingStatus is undefined so it just disappears from the JSON. Price always comes from the catalogue, the client can only send testStatus.
- Tested in Postman (desktop app, Sun 15 Nov night):
  GET /payments/prepare/1, 2, 3 -> 200 with the right name and amount; /999 -> 404 Service not found; /1?amount=1 -> still 35. Postman shows the status code, which the browser didn't.
  POST /payments/mock MC1–MC5 all matched (PENDING -> AWAITING_PAYMENT, APPROVED -> CONFIRMED, DECLINED -> PAYMENT_FAILED, 999 -> 404, {} -> PENDING).
  First POST attempt I sent to /payments/prepare/1 by mistake and got 404 "Cannot POST" – that route only has GET, the POST one is /payments/mock/:serviceId.
  For GET requests body is set to none, for POST body is raw JSON.

## Week 4 – L8 service booking (Sun 15 – Mon 16 Nov, late night)

Setup:
- Made Week04/Lesson08/PetCareApp as a copy of my Lesson06 app. Added specs/service-booking.md, specs/service-booking-implementation.md, views/services.ejs, views/bookings.ejs and db-lesson08-extension.sql from Resources L8.
- Mistake: in Workbench I ran db.sql twice by accident instead of the L8 extension script (the tab was called "db"). It reset users/pets/journal back to the sample data, so my test1/test2 users were gone – nothing important, and clara/Mira came back which L8 needs. Then copied the extension script into the project, pasted it into a new query tab and ran it once: services / service_bookings / payments created, 8 services, 0 bookings, 0 payments, clara owns Mira (pet 5). The yellow warning on CREATE TABLE services is only about the int display width, harmless.

Planning (slides Exercise 5 prompt 1):
- Claude read both specs, the SQL and the two EJS shells and proposed: serviceModel, serviceBookingModel, serviceController, serviceRoutes, mount in app.js, add navbar links. Shells used as is.
- It flagged a conflict: implementation spec section 6 says use one connection from a shared pool for the transaction, but config/db.js (mine and the lecturer's L8 copy) uses a single createConnection. On a single shared connection another request's query could land in the middle of the transaction.
  Option A: switch to createPool (existing models keep working because pool.query is the same).
  Option B: keep the single connection.
  I chose option A to follow the spec.
- Not added (spec says not to): real payment, duplicate booking check, max booking date, cancel, status changes.

Build:
- config/db.js – createConnection -> createPool (connectionLimit 10). One thing that changes: with a pool, a wrong MySQL password no longer crashes the app at start-up, it shows up on the first query instead (e.g. login says "Unable to log in").
- models/serviceModel.js – getActiveServices: SELECT id, name, price FROM services WHERE is_active = 1 ORDER BY name.
- models/serviceBookingModel.js –
  createPendingBooking: gets one connection from the pool, beginTransaction, INSERT ... SELECT into service_bookings that only inserts if the pet's owner_id is the logged-in user AND the service is active, price taken from services.price. If 0 rows inserted -> rollback, return null (unavailable). Then inserts the payment using the booking's booked_price, status pending, payment_reference left NULL. Commit only after both. Any error -> rollback and pass the error up. Connection released on every path, callback only called once.
  getBookingsByOwner: joins bookings + pets + services, LEFT JOIN payments, only this owner's pets, newest first, booking_date formatted as YYYY-MM-DD in SQL.
- controllers/serviceController.js – listServices, createBooking, listBookings. Owner id always from req.session.user.id. Validation: petId/serviceId must be whole numbers > 0, date must be YYYY-MM-DD, a real date (2027-02-30 rejected), and today or later using the computer's local date. Exact messages from spec section 7. Load errors return 500 with "Unable to load pets." / "Unable to load services." / "Unable to load booking history.". DB save error redirects to /services?petId=...
- routes/serviceRoutes.js – GET /services, POST /services/book, GET /bookings, all isLoggedIn.
- app.js – mounted serviceRoutes after paymentRoutes.
- views/partials/navbar.ejs – added "Book a Service" and "Booking History" links for logged-in users.

Checks before browser testing (no DB, using a fake pool):
- Transaction: success = begin, booking, payment, commit, release. Unavailable = rollback, null. Booking insert fails / payment insert fails / commit fails / can't start transaction / can't get connection -> error, rolled back where started, connection released, callback once, never success. (This covers AC6, which is hard to test by clicking.)
- Validation: today and a future date accepted; yesterday, 2027-02-30, 15/01/2027, missing date, petId 0 / -2 / abc, empty serviceId, no body -> "Choose a pet, service, and valid booking date."
- Rendered services.ejs and bookings.ejs with sample data: pet preselect works, S$25.00 shows, no-pets message, "No payment record" shows when payment is null, navbar links show.
- Browser testing (Mon 16 Nov ~1am), sample logins from db.sql (clara/amy/ben user123, admin1 admin123):
  AC1 – clara booked Mira + Basic Bath for today -> went to Booking History with "Booking created. Payment is pending; no payment has been processed.", row shows S$25.00, pending, pending.
  AC2 – future date also accepted.
  AC7 – logged in as amy, Booking History shows "You have no bookings yet." (clara's bookings not shown). Clara sees her own.
  AC8 – logged out, /services and /bookings redirect to /login.
  Regression – amy's journals page and the admin user details page still work.
  The Booking History link was hidden at first – the window was narrow so the navbar links were inside the ☰ menu.
  AC3–AC5 not tried in the browser (the form's dropdown / date picker stops most bad input) – covered by the controller checks above. AC6 covered by the fake-pool checks above.
