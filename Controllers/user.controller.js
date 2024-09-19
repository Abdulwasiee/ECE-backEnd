const userService = require("../Services/users.service");

// Create a new user
const createUser = async (req, res) => {
  const userData = req.body;
  const reqUser = req.user;
  const result = await userService.createUser(userData, reqUser);
  return res.json({
    result,
  });
};

// Get all users
const getAllUsers = async (req, res) => {
  const reqUser = req.user;
  const { semesterId } = req.params;
  let role_id;
  if (reqUser.role_id == 2 || reqUser.role_id == 5) {
    role_id = 3;
  } else {
    role_id = req.params.role_id;
  }

  const result = await userService.getAllUsers(reqUser, role_id, semesterId);
  return res.json({
    result,
  });
};

// Update user by ID
const updateUserById = async (req, res) => {
  const userData = req.body;
  const { userId } = req.params;

  const result = await userService.updateUserById(userId, userData);
  return res.json({ result });
};

// Delete user by ID
const deleteUserById = async (req, res) => {
  const { userId } = req.params;
  const result = await userService.deleteUserById(userId);
  return res.json({ result });
};

module.exports = {
  createUser,
  updateUserById,
  deleteUserById,
  getAllUsers,
};
