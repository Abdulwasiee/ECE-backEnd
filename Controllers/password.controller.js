const { changePasswordService } = require("../Services/password.service");

const changePasswordController = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.user_id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Both current and new passwords are required.",
    });
  }

  try {
    // Call the change password service
    const result = await changePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in changePasswordController:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing the password.",
    });
  }
};
module.exports = { changePasswordController };
