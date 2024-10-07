const express = require("express");
const password = require("../controllers/password.controller");
const { authMiddleware } = require("../Middlewire/Auth");

const router = express.Router();

// router to change password
router.post(
  "/api/changePassword",
  authMiddleware([3, 4, 5]),
  password.changePassword
);

module.exports = router;
