const validator = require("validator");
const jwt = require("jsonwebtoken");
const { query } = require("../Config/database.config");
require("dotenv").config();
const jwt_secret_key = process.env.SECRET_KEY;

// Add Student Service
const addStudent = async (studentData) => {
  const {
    first_name,
    last_name,
    id_number,
    batch_id,
    stream_id = null,
    semester,
  } = studentData;
  const role_id = 2; // Role ID for "Student" role

  // Validation
  if (!first_name || !last_name || !id_number || !batch_id) {
    return {
      success: false,
      message: "All fields are required.",
    };
  }

  // Numeric batch and validation logic
  const numericBatchId = parseInt(batch_id, 10);
  const nextYear = numericBatchId + 1;

  // Semester and stream validation for specific batches
  if (numericBatchId == 3) {
    if (!semester) {
      return {
        success: false,
        message: `Semester is required for ${nextYear}th year.`,
      };
    }
    if (semester == 2 && !stream_id) {
      return {
        success: false,
        message: `Stream is required for ${nextYear}th year second semester.`,
      };
    }
  }

  if (numericBatchId == 4 && !stream_id) {
    return {
      success: false,
      message: `Stream is required for ${nextYear}th year.`,
    };
  }

  // Name and ID validation
  if (!validator.isAlpha(first_name) || !validator.isAlpha(last_name)) {
    return {
      success: false,
      message: "First and last names must contain only letters.",
    };
  }

  if (!validator.isAlphanumeric(id_number)) {
    return {
      success: false,
      message: "ID number must be alphanumeric.",
    };
  }

  // Check if the student already exists
  const checkStudentSql = "SELECT * FROM students WHERE id_number = ?";
  try {
    const existingStudent = await query(checkStudentSql, [id_number]);

    if (existingStudent.length > 0) {
      return {
        success: false,
        message: "A student with this ID number already exists.",
      };
    }

    // Insert student into the database
    const sql = `
      INSERT INTO students (first_name, last_name, id_number, batch_id, role_id, stream_id)
      VALUES (?, ?, ?, ?, ?, ?)`;

    const result = await query(sql, [
      first_name,
      last_name,
      id_number,
      batch_id,
      role_id,
      stream_id,
    ]);

    // Create batch_ids array
    const batch_ids = [batch_id]; // Since each student is assigned to a single batch, use an array

    // Generate JWT token
    const payload = {
      user_id: result.insertId,
      batch_ids,
      role_id,
      stream_id,
    };

    const token = jwt.sign(payload, jwt_secret_key, {
      expiresIn: "2h",
    });

    return {
      success: true,
      message: "Student Registerd successfully.",
      token,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getStudentsByBatch = async (batch_id, stream_id) => {
  if (!batch_id) {
    return { success: false, message: "Batch ID is required." };
  }

  try {
    let sql = `
      SELECT 
        s.student_id, 
        s.first_name, 
        s.last_name, 
        s.id_number, 
        s.batch_id, 
        b.batch_year,  
        s.stream_id, 
        st.stream_name, 
        s.role_id
      FROM students s
      LEFT JOIN batches b ON s.batch_id = b.batch_id
      LEFT JOIN streams st ON s.stream_id = st.stream_id
      WHERE s.batch_id = ?`;

    const params = [batch_id];

    // If stream_id is provided, add it to the query
    if (stream_id) {
      sql += ` AND s.stream_id = ?`;
      params.push(stream_id);
    }

    const students = await query(sql, params);

    if (students.length === 0) {
      return {
        success: false,
        message: "No students found for this batch and stream.",
      };
    }

    return { success: true, students };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deleteStudent = async (student_id) => {
 
  try {
    const sql = "DELETE FROM students WHERE student_id = ?";
    const result = await query(sql, [student_id]);
    if (result.affectedRows > 0) {
      return { success: true, message: "Student deleted successfully." };
    } else {
      return { success: false, message: "Student not found." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  addStudent,
  getStudentsByBatch,
  deleteStudent,
};
