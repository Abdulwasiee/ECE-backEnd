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
  } = studentData;

  const role_id = 2; // Role ID for "Student" role

  // Validation
  if (!first_name || !last_name || !id_number || !batch_id) {
    return {
      success: false,
      message: "All fields are required.",
    };
  }

  if (!validator.isAlpha(first_name) || !validator.isAlpha(last_name)) {
    return {
      success: false,
      message: "First and last names must contain only letters.",
    };
  }

  if (!validator.isAlphanumeric(id_number)) {
    return { success: false, message: "ID number must be alphanumeric." };
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
      student_id: result.insertId,
      batch_ids,
      role_id,
      stream_id,
    };

    const token = jwt.sign(payload, jwt_secret_key, {
      expiresIn: "2h",
    });

    return {
      success: true,
      message: "Student added successfully.",
      token,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getStudentsByBatch = async (batch_id) => {
  // Validate batch_id
  if (!batch_id) {
    return { success: false, message: "Batch ID is required." };
  }

  try {
    const sql = `
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

    const students = await query(sql, [batch_id]);

    if (students.length === 0) {
      return { success: false, message: "No students found for this batch." };
    }

    return { success: true, students };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deleteStudent = async (student_id) => {
  // Validate student_id
  if (!student_id) {
    return { success: false, message: "Student ID is required." };
  }

  try {
    const sql = "DELETE FROM students WHERE student_id = ?";
    const [result] = await query(sql, [student_id]);
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
