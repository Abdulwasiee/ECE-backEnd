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

router.post("/api/requestPasswordReset", password.sendPasswordResetEmail);

router.post("/api/resetPassword", password.resetPassword);

module.exports = router;
