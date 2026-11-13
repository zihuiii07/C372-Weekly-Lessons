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
