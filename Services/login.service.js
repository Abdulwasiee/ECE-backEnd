const { query } = require("../Config/database.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwt_secret_key = process.env.SECRET_KEY;

const loginService = async (loginData) => {
  const { email, password } = loginData;

  // Validate email and password
  if (!email || !password) {
    return {
      success: false,
      message: "Please provide both email and password.",
    };
  }

  try {
    // Query the database to find the user by email
    const user = await query(
      `SELECT u.user_id, u.role_id, u.email, u.password, u.batch_id, u.semester_id, u.stream_id
       FROM users u 
       WHERE u.email = ?`,
      [email]
    );

    if (user.length > 0) {
      // Verify the password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
      if (!isPasswordValid) {
        return { success: false, message: "Invalid Email or Password." };
      }
      let batch_ids = [];
      let courses = [];

      // If the user is staff, retrieve the assigned courses
      if (user[0].role_id === 3) {
        const batchData = await query(
          `SELECT sb.batch_id 
           FROM staff_batches sb 
           WHERE sb.user_id = ?`,
          [user[0].user_id]
        );
        if (batchData.length > 0) {
          batch_ids = batchData.map((batch) => batch.batch_id);
        }

        const courseData = await query(
          `SELECT sc.course_id, c.course_name 
           FROM staff_courses sc 
           LEFT JOIN courses c ON sc.course_id = c.course_id 
           WHERE sc.user_id = ?`,
          [user[0].user_id]
        );

        if (courseData.length > 0) {
          courses = courseData.map((course) => ({
            course_id: course.course_id,
            course_name: course.course_name,
          }));
        }
      } else batch_ids = [user[0].batch_id];
      // Generate JWT token with batch_id, stream_id, and semester_id
      const payload = {
        user_id: user[0].user_id,
        role_id: user[0].role_id,
        batch_ids,
        semester_id: user[0].semester_id,
        stream_id: user[0].stream_id,
        courses, // Only for staff
      };

      const token = jwt.sign(payload, jwt_secret_key, { expiresIn: "2h" });

      return {
        success: true,
        message: "Login successful.",
        token,
      };
    } else {
      return { success: false, message: "Invalid Email or Password." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
const studentLoginService = async (loginData) => {
  const { id_number, first_name } = loginData;

  // Validate ID number and first name
  if (!id_number || !first_name) {
    return {
      success: false,
      message: "Please provide both ID number and first name.",
    };
  }

  try {
    // Query the database to find the student by ID number and first name, and include stream and batch information
    const sql = `
      SELECT 
        s.student_id AS user_id, 
        s.role_id, 
        s.batch_id, 
        s.first_name, 
        s.stream_id, 
        st.stream_name,  
        b.batch_year     
      FROM students s
      LEFT JOIN streams st ON s.stream_id = st.stream_id
      LEFT JOIN batches b ON s.batch_id = b.batch_id
      WHERE s.id_number = ? AND s.first_name = ?`;

    const student = await query(sql, [id_number, first_name]);

    if (student.length > 0) {
      const { user_id, role_id, batch_id, stream_id, stream_name, batch_year } =
        student[0];

      // Prepare batch IDs array (single batch in this case)
      const batch_ids = [batch_id];

      // Generate JWT token with additional information
      const payload = {
        user_id,
        role_id,
        batch_ids,
        stream_id,
        stream_name,
        batch_year, // Include stream_id in payload if needed
      };

      const token = jwt.sign(payload, jwt_secret_key, {
        expiresIn: "2h",
      });

      return {
        success: true,
        message: "Login successful.",
        token,
      };
    } else {
      return { success: false, message: "Invalid ID number or first name." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = { loginService, studentLoginService };
