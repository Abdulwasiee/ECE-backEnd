const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user.controller");
const { authMiddleware } = require("../Middlewire/Auth");

// router to add user
router.post(
  "/api/addUsers",
  authMiddleware([1, 4]),

  userController.createUser
);

// router to get all users based on role_id
router.get(
  "/api/getUsers/:role_id",
  authMiddleware([1, 2, 4, 5]),
  userController.getAllUsers
);

// router to get all assigned staff members
router.get(
  "/api/assignedStaff",
  authMiddleware([1, 2, 4, 5]),
  userController.assignedStaff
);

// router to get all staff members
router.get(
  "/api/getStaffs",
  authMiddleware([1, 2, 4, 5]),
  userController.getStaff
);

// router to update  user by id
router.put(
  "/api/updateUser/:id",
  authMiddleware([1]),
  userController.updateUserById
);

// router to delete user by id
router.delete(
  "/api/deleteUser/:userId",
  authMiddleware([1, 4, 5]),
  userController.deleteUserById
);

module.exports = router;
