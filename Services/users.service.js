const { query } = require("../Config/database.config");
const bcrypt = require("bcrypt");

// Helper function to validate required fields
const validateUserData = async (userData) => {
  const requiredFields = ["id_number", "name", "email"];
  const missingFields = requiredFields.filter((field) => !userData[field]);
  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  return { success: true };
};

// Helper function to hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Helper function to check if user exists
const userExists = async (id_number, email) => {
  id_number = id_number !== undefined ? id_number : null;
  email = email !== undefined ? email : null;

  const sql = `
    SELECT 1
    FROM users
    WHERE id_number = ? OR email = ?
  `;
  try {
    const result = await query(sql, [id_number, email]);
    return result.length > 0;
  } catch (error) {
    return {
      success: false,
      message: `Error checking if user exists: ${error.message}`,
    };
  }
};

// Create a new user
const createUser = async (userData, reqUser) => {
  const validation = await validateUserData(userData);
  if (!validation.success) {
    return validation;
  }

  let {
    role_id,
    id_number,
    name,
    email,
    password,
    batch_id,
    course_id,
    stream_id,
    semester_id,
  } = userData;

  // Representatives and department admins can only create staff members
  if (reqUser.role_id === 5 || reqUser.role_id === 4) {
    role_id = 3; // Force staff role
  }

  try {
    // Check if user already exists by ID number or email
    const exists = await userExists(id_number, email);
    if (exists) {
      return {
        success: false,
        message: "User with this ID number or email already exists.",
      };
    }

    // If representative is creating the user, assign their batch to the user
    if (reqUser.role_id === 5) {
      batch_id = reqUser.batch_ids[0]; // Assume representative has access to only one batch
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the users table
    const sql = `
      INSERT INTO users (role_id, id_number, name, email, password, batch_id, stream_id, semester_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      role_id,
      id_number,
      name,
      email,
      hashedPassword,
      batch_id || null,
      stream_id || null,
      semester_id || null,
    ]);

    if (result.affectedRows > 0) {
      const userId = result.insertId;

      // Handle staff batch, stream, and course assignments
      if (role_id == 3) {
        await query(
          `
          INSERT INTO staff_batches (user_id, batch_id, stream_id, semester_id)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE batch_id = ?, stream_id = ?, semester_id = ?
        `,
          [
            userId,
            batch_id,
            stream_id,
            semester_id,
            batch_id,
            stream_id || null,
            semester_id,
          ]
        );

        if (course_id) {
          await query(
            `
            INSERT INTO staff_courses (user_id, course_id, batch_id, stream_id, semester_id)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE course_id = ?, batch_id = ?, stream_id = ?, semester_id = ?
          `,
            [
              userId,
              course_id,
              batch_id,
              stream_id,
              semester_id,
              course_id,
              batch_id,
              stream_id || null,
              semester_id,
            ]
          );
        }
      }

      return {
        success: true,
        message: "User created successfully.",
        userId: userId,
      };
    } else {
      return { success: false, message: "User creation failed." };
    }
  } catch (error) {
    return { success: false, message: error.message || "An error occurred." };
  }
};
const getAllUsers = async (role_id, semester_id, batch_id, stream_id) => {
  let sql = `
    SELECT 
      u.user_id, 
      r.role_name, 
      r.role_id,
      u.id_number, 
      u.name, 
      u.email, 
      b.batch_year,
      b.batch_id,
      COALESCE(sb_staff.batch_id) AS staffBatch_id,
      sm.semester_name,
      COALESCE(sc.semester_id, 0) AS semester_id,
      u.stream_id,        
      st.stream_name,      
      c.course_name, 
      u.created_at, 
      u.updated_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN batches b ON u.batch_id = b.batch_id
    LEFT JOIN semesters sm ON u.semester_id = sm.semester_id
    LEFT JOIN streams st ON u.stream_id = st.stream_id
    LEFT JOIN staff_batches sb_staff ON u.user_id = sb_staff.user_id
    LEFT JOIN staff_courses sc ON u.user_id = sc.user_id 
    LEFT JOIN courses c ON sc.course_id = c.course_id 
    WHERE u.role_id = ?
  `;

  const queryParams = [role_id];

  if (role_id == 3 || role_id == 5) {
    if (role_id == 3 && semester_id != null) {
      sql += " AND u.semester_id = ?";
      queryParams.push(semester_id);
    }

    if (batch_id != null) {
      sql += " AND u.batch_id = ?";
      queryParams.push(batch_id);
    }

    if (stream_id != null) {
      sql += " AND u.stream_id = ?";
      queryParams.push(stream_id);
    }
  }

  try {
    let users = await query(sql, queryParams);
    return { success: true, users };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
const updateUserById = async (userId, userData) => {
  const validation = await validateUserData(userData);
  if (!validation.success) {
    return validation;
  }

  let {
    role_id,
    id_number,
    name,
    email,
    password,
    batch_id,
    course_id,
    stream_id,
    semester_id,
  } = userData;
  const hashedPassword = password ? await hashPassword(password) : undefined;

  try {
    // Check if another user with the same id_number or email exists, excluding the current user
    const exists = await userExists(id_number, email);
    if (exists) {
      return {
        success: false,
        message: "User with this ID number or email already exists.",
      };
    }

    // Build the SQL query for updating the user in the users table
    let sql = `
      UPDATE users
      SET role_id = ?, id_number = ?, name = ?, email = ?${
        hashedPassword ? ", password = ?" : ""
      }
      WHERE user_id = ?
    `;
    const params = [role_id, id_number, name, email];
    if (hashedPassword) {
      params.push(hashedPassword);
    }
    params.push(userId);

    // Execute the update query
    const result = await query(sql, params);

    // Handle staff batch, course, stream, and semester assignments if role is staff (role_id = 3)
    if (role_id === 3) {
      // Update staff_batches table
      await query(
        `
          INSERT INTO staff_batches (user_id, batch_id, stream_id, semester_id)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE batch_id = ?, stream_id = ?, semester_id = ?
        `,
        [
          userId,
          batch_id,
          stream_id,
          semester_id,
          batch_id,
          stream_id,
          semester_id,
        ]
      );

      // Update staff_courses if course_id is provided
      if (course_id) {
        await query(
          `
            INSERT INTO staff_courses (user_id, course_id, batch_id, stream_id, semester_id)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE course_id = ?, batch_id = ?, stream_id = ?, semester_id = ?
          `,
          [
            userId,
            course_id,
            batch_id,
            stream_id,
            semester_id,
            course_id,
            batch_id,
            stream_id,
            semester_id,
          ]
        );
      }

      return { success: true, message: "User updated successfully." };
    } else {
      return { success: false, message: "User update failed." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deleteUserById = async (userId) => {
  try {
    // Delete related records from staff_batches
    await query(`DELETE FROM staff_batches WHERE user_id = ?`, [userId]);

    // Delete related records from staff_courses
    await query(`DELETE FROM staff_courses WHERE user_id = ?`, [userId]);

    // Delete related records from contacts table
    await query(`DELETE FROM contacts WHERE user_id = ?`, [userId]);

    // Delete related records from news table
    await query(`DELETE FROM news WHERE posted_by = ?`, [userId]);

    // Finally, delete the user from the users table
    const sql = `DELETE FROM users WHERE user_id = ?`;
    const result = await query(sql, [userId]);

    if (result.affectedRows > 0) {
      return { success: true, message: "User deleted successfully." };
    } else {
      return { success: false, message: "User not found." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
const getStaffDetails = async (semester_id, batch_id, stream_id = null) => {
  // Base query to fetch staff details
  let baseQuery = `
  SELECT 
    sb.user_id,
    u.name,
    c.course_name,
    c.course_id,
    s.stream_name,
    b.batch_year,
    b.batch_id,
    sb.semester_id,
    sem.semester_name  -- Add semester_name to the selected fields
  FROM 
    staff_batches sb
  JOIN 
    users u ON sb.user_id = u.user_id
  JOIN 
    staff_courses sc ON sb.user_id = sc.user_id
  JOIN 
    courses c ON sc.course_id = c.course_id
  JOIN 
    batches b ON sb.batch_id = b.batch_id
  LEFT JOIN 
    streams s ON sb.stream_id = s.stream_id
  JOIN
    semesters sem ON sb.semester_id = sem.semester_id  
  WHERE 
    sb.semester_id = ? 
    AND sb.batch_id = ?
`;
  const params = [semester_id, batch_id];

  // Add stream_id condition if it's provided
  if (stream_id != null) {
    baseQuery += " AND sb.stream_id = ?";
    params.push(stream_id);
  }

  try {
    const users = await query(baseQuery, params);

    if (users.length === 0) {
      return { success: false, message: "No staff found." };
    }

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("Error fetching staff details:", error);
    return { success: false, message: "Error fetching staff details." };
  }
};
module.exports = {
  createUser,
  getAllUsers,
  deleteUserById,
  updateUserById,
  getStaffDetails,
};
