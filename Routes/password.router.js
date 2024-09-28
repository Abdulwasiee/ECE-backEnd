const express = require("express");
const {
  changePasswordController,
} = require("../controllers/password.controller");
const { authMiddleware } = require("../Middlewire/Auth");

const router = express.Router();

router.post(
  "/changePassword",
  authMiddleware[(1, 3, 4, 5)],
  changePasswordController
);

module.exports = router;
