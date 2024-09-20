const express = require("express");

const router = express.Router();
const { checkUser } = require("../Controllers/checkUser.controller");
const { checkAuthStatus } = require("../Middlewire/Auth");
router.get("/api/checkUser", checkAuthStatus, checkUser);

module.exports = router;
