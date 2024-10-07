const express = require("express");
const router = express.Router();
const installController = require("../Controllers/install.controller");

// Install endpoint
router.get("/install", installController.install);
module.exports = router;
