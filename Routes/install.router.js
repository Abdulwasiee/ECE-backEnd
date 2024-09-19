const express = require("express");
const router = express.Router();
const installController = require("../Controllers/install.controller");
router.get("/install", installController.install);
module.exports = router;
