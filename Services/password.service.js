const bcrypt = require("bcrypt");
const { query } = require("../Config/database.config");

const changePasswordService = async (userId, currentPassword, newPassword) => {
  try {
    // Fetch the user's current password from the database
    const sql = "SELECT password FROM users WHERE user_id = ?";
    const user = await query(sql, [userId]);

    const userPassword = user[0].password;

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, userPassword);
    if (!isMatch) {
      return { success: false, message: "Old password is incorrect" };
    }
    const newMatch = await bcrypt.compare(newPassword, userPassword);
    if (newMatch) {
      return {
        success: false,
        message:
          "New password cannot be the same as the old one. Please choose a different password.",
      };
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const updateQuery = "UPDATE users SET password = ? WHERE user_id = ?";
    const result = await query(updateQuery, [hashedPassword, userId]);

    if (result.affectedRows === 0) {
      return { success: false, message: "Failed to update password" };
    }

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error in changePasswordService:", error);
    return { success: false, message: "An error occurred" };
  }
};
module.exports = { changePasswordService };
