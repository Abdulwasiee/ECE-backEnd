const express = require("express");

const router = express.Router();
const { checkUser } = require("../Controllers/checkUser.controller");
const { checkAuthStatus } = require("../Middlewire/Auth");

// Middleware to check if user is authenticated before accessing the API endpoint
router.get("/api/checkUser", checkAuthStatus, checkUser);

module.exports = router;
