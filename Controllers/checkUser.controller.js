const { query } = require("../Config/database.config");

const checkUser = async (req, res) => {
  const { role_id, batch_ids, user_id, stream_id } = req.user;

  try {
    let first_name = null;
    let last_name = null;

    if (role_id === 2) {
      const student = await query(
        "SELECT first_name, last_name FROM students WHERE student_id = ?",
        [user_id]
      );

      if (student.length > 0) {
        first_name = student[0].first_name;
        last_name = student[0].last_name;
      } else {
        return res.status(404).json({
          message: "Student not found",
          success: false,
        });
      }
    } else {
      const user = await query("SELECT name FROM users WHERE user_id = ?", [
        user_id,
      ]);

      if (user.length > 0) {
        const fullName = user[0].name.split(" ");
        first_name = fullName[0];
        last_name = fullName.slice(1).join(" ");
      } else {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }
    }

    return res.json({
      message: "User authenticated successfully",
      success: true,
      role_id,
      batch_ids,
      user_id,
      stream_id,
      first_name,
      last_name,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = { checkUser };
