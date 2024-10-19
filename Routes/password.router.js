const express = require("express");
const {
  sendPasswordResetEmail,
  resetPassword,
  changePassword,
} = require("../controllers/password.controller");
const { authMiddleware } = require("../Middlewire/Auth");

const router = express.Router();

// router to change password
router.post("/api/changePassword", authMiddleware([3, 4, 5]), changePassword);

router.post("/api/requestPasswordReset", sendPasswordResetEmail);

router.post("/api/resetPassword", resetPassword);

module.exports = router;
