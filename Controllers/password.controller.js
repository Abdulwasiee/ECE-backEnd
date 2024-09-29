const { changePasswordService } = require("../Services/password.service");

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.user_id;

  if (!oldPassword || !newPassword) {
    return res.json({
      result: {
        success: false,
        message: "Both current and new passwords are required.",
      },
    });
  }
  if (newPassword.length < 8) {
    return res.json({
      result: {
        success: false,
        message: "New password must be at least 8 characters long.",
      },
    });
  }
  try {
    // Call the change password service
    const result = await changePasswordService(
      userId,
      oldPassword,
      newPassword
    );

    // Respond with success message
    return res.json({
      result,
    });
  } catch (error) {
    console.error("Error in changePasswordController:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing the password.",
    });
  }
};
module.exports = { changePassword };
