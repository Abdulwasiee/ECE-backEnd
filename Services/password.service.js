const bcrypt = require("bcrypt");
const { query } = require("../Config/database.config");
const { sendPasswordResetEmail } = require("./email.service");
const jwt = require("jsonwebtoken");
require("dotenv").config;
const jwt_secret_key = process.env.SECRET_KEY;
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

// Service to handle password reset request
const requestPasswordReset = async (email) => {
  try {
    // Query the database to find the user by email
    const user = await query(
      `SELECT user_id, email FROM users WHERE email = ?`,
      [email]
    );

    // If no user found, return error
    if (user.length === 0) {
      return { success: false, message: "No user found with this email." };
    }

    // Get user ID and email
    const { user_id, email: userEmail } = user[0];

    // Generate a password reset token (e.g., JWT) with a short expiration time
    const token = jwt.sign({ user_id, email: userEmail }, jwt_secret_key, {
      expiresIn: "15m", // Token expires in 15 minutes
    });

    // Construct reset link
    const resetLink = `https://electrical-engineering-by-abdu.netlify.app/${token}`;

    // Send password reset email with the token
    await sendPasswordResetEmail(userEmail, resetLink);

    return { success: true, message: "Password reset email sent." };
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    return { success: false, message: "An error occurred." };
  }
};

const resetNewPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    return {
      success: false,
      message: "Token and new password are required.",
    };
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, jwt_secret_key);
    const userId = decoded.user_id;

    // Check if the user exists
    const user = await query(
      `SELECT user_id, email FROM users WHERE user_id = ?`,
      [userId]
    );

    if (user.length === 0) {
      return { success: false, message: "User not found." };
    }

    // Hash the new password (you might want to use a library like bcrypt)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await query(`UPDATE users SET password = ? WHERE user_id = ?`, [
      hashedPassword,
      userId,
    ]);

    return {
      success: true,
      message: "Password has been successfully reset.",
    };
  } catch (error) {
    console.error("Error in resetPassword:", error);

    // Check for token expiration
    if (error.name === "TokenExpiredError") {
      return {
        success: false,
        message: "Token has expired. Please request a new password reset.",
      };
    }

    return { success: false, message: "Internal server error." };
  }
};
module.exports = {
  changePasswordService,
  requestPasswordReset,
  resetNewPassword,
};
