const userService = require("../Services/users.service");

// Create a new user
const createUser = async (req, res) => {
  const userData = req.body;
  const reqUser = req.user;
  console.log(reqUser)
  console.log(userData)
  const result = await userService.createUser(userData, reqUser);
  return res.json({
    result,
  });
};

// Get all users
const getAllUsers = async (req, res) => {
  const reqUser = req.user;
  const { semester_id } = req.query;
  let stream_id, batch_id, role_id;
  

  if (reqUser.role_id == 2 || reqUser.role_id == 5) {
    stream_id = reqUser.stream_id != null ? reqUser.stream_id : null;
    batch_id = reqUser.batch_ids[0];
    role_id = 3;
  } else {
    role_id = req.params.role_id;
    stream_id = req.query.stream_id || null;
    batch_id = req.query.batch_id || null;
  }

  try {
    const result = await userService.getAllUsers(
      role_id,
      semester_id,
      batch_id,
      stream_id
    );

    return res.json({
      success: true,
      users: result.users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
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
