const express = require("express");

const router = express.Router();
const {
  loginController,
  studentLoginController,
} = require("../Controllers/login.controller");


router.post("/api/user/login", loginController);
router.post("/api/student/login", studentLoginController);
module.exports = router;
