const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user.controller");
const { authMiddleware } = require("../Middlewire/Auth");

// Admins and Representatives can create, update, and delete users, but we add role-specific checks for representatives
router.post(
  "/api/addUsers",
  authMiddleware([1, 4, 5]),

  userController.createUser
);
router.get(
  "/api/getUsers/:role_id",
  authMiddleware([1, 2, 4, 5]),
  userController.getAllUsers
);
router.get(
  "/api/getStaffs",
  authMiddleware([1, 2, 4, 5]),
  userController.getStaff
);

router.put(
  "/api/updateUser/:id",
  authMiddleware([1]),
  userController.updateUserById
);
router.delete(
  "/api/deleteUser/:userId",
  authMiddleware([1, 4, 5]),
  userController.deleteUserById
);

module.exports = router;
