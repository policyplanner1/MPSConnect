const express = require("express");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

const {
  signup,
  login,
  getCurrentUser,
} = require("./auth.controller");

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

const {
  protect,
} = require("./auth.middleware");

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

router.post("/signup", signup);

router.post("/login", login);

router.get(
  "/me",
  protect,
  getCurrentUser
);

module.exports = router;