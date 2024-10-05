const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middlewire/Auth");
const contactController = require("../Controllers/contact.controller");
router.post(
  "/api/addContact",
  authMiddleware([1, 3, 4,5]),
  contactController.addContact
);
router.get(
  "/api/getContact/:userId",
  authMiddleware([1, 2, 3, 4, 5]),
  contactController.getContactInformation
);
router.put(
  "/api/updateContact/:userId",
  authMiddleware([1, 3, 4,5]),
  contactController.updateContactInfo
);
router.delete(
  "/api/deleteContact/:userId",
  authMiddleware([1, 3, 4,5]),
  contactController.deleteContactInfo
);
module.exports = router;
