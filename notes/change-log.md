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
