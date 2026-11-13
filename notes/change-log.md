# C372 CA1 – change log

Rough notes of what was changed, kept while working. Used later for the AI journal.

## Week 2 – L3 MVC refactor (Fri 13 Nov)

Before starting:
- Week01 app was set up on the other laptop, so on this Mac MySQL kept saying "Access denied for user root". Reset the MySQL root password on this Mac (safe mode, --skip-grant-tables) to the same one as the other laptop so app.js works on both.
- Ran db.sql in Workbench to create the petcare database here.
- Copied Week01/PetCareApp into Week02/PetCareApp, committed as the starting point.

Gave Claude the L3 MVC refactoring spec as the prompt. It listed all 17 routes from app.js, suggested the folder layout and a staged plan first. I checked the route list against my app.js and approved the plan. Kept the file names the same as the lecturer's Week02 repo (homeController / homeRoutes).

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
