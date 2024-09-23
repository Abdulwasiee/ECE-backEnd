const { query } = require("../Config/database.config");

const createCourse = async (
  courseName,
  courseCode,
  batchId,
  semesterId,
  streamId = null
) => {
  if (!courseName || !batchId || !semesterId) {
    return {
      success: false,
      message: "Course name, batch ID, and semester ID are required",
    };
  }

  const createCourseSql = `INSERT INTO courses (course_name, course_code) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE course_name = VALUES(course_name), course_code = VALUES(course_code);`;

  const assignBatchCourseSql = `
    INSERT INTO batch_courses (batch_id, course_id, semester_id, stream_id)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      batch_id = VALUES(batch_id), 
      course_id = VALUES(course_id), 
      semester_id = VALUES(semester_id), 
      stream_id = VALUES(stream_id);
  `;

  try {
    // Insert the course and get the new course ID (or retrieve the existing one)
    const result = await query(createCourseSql, [courseName, courseCode]);
    const courseId = result.insertId;

    // Assign the course to the batch, including optional stream_id
    await query(assignBatchCourseSql, [
      batchId,
      courseId,
      semesterId,
      streamId,
    ]);

    return { success: true, courseId };
  } catch (error) {
    return {
      success: false,
      message: "Error creating course: " + error.message,
    };
  }
};

const getAllCourses = async (batchId, semesterId, streamId = null) => {
  if (!batchId || !semesterId) {
    return { success: false, message: "Batch ID and semester ID are required" };
  }

  // Base SQL query
  let sql = `
  SELECT 
    bc.batch_course_id, 
    c.course_id, 
    c.course_name, 
    c.course_code,      
    b.batch_id, 
    b.batch_year,
    s.stream_name  
  FROM 
    batch_courses bc
  LEFT JOIN 
    courses c ON bc.course_id = c.course_id
  LEFT JOIN 
    batches b ON bc.batch_id = b.batch_id
  LEFT JOIN 
    streams s ON bc.stream_id = s.stream_id 
  WHERE 
    bc.batch_id = ? AND 
    bc.semester_id = ?
`;
  // If streamId is provided, add it to the query
  const params = [batchId, semesterId];
  if (streamId) {
    sql += " AND bc.stream_id = ?";
    params.push(streamId);
  }

  try {
    const courses = await query(sql, params);

    // Check if any courses were found
    if (courses.length === 0) {
      return {
        success: true,
        courses,
        message: "No courses found for the selected semester",
      };
    }

    return { success: true, courses };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving courses: " + error.message,
    };
  }
};
// Update a course by its ID
const updateCourseById = async (
  courseId,
  courseName,
  courseCode,
  batchId,
  streamId = null,
  semesterId
) => {
  if (!courseName || !courseCode || !batchId || !semesterId) {
    return {
      success: false,
      message:
        "Course name, course code, batch ID, and semester ID are required",
    };
  }

  const updateCourseSql = `UPDATE courses SET course_name = ?, course_code = ? WHERE course_id = ?`;
  const updateBatchCourseSql = `
    INSERT INTO batch_courses (batch_id, course_id, stream_id, semester_id)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE batch_id = VALUES(batch_id), stream_id = VALUES(stream_id), semester_id = VALUES(semester_id);
  `;

  try {
    // Update the course name and code
    await query(updateCourseSql, [courseName, courseCode, courseId]);

    // Update the batch_courses table with the new details
    await query(updateBatchCourseSql, [
      batchId,
      courseId,
      streamId,
      semesterId,
    ]);

    return { success: true, message: "Course updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Error updating course: " + error.message,
    };
  }
};

// Assign a course to a staff member
const assignCourseToStaff = async (
  user_id,
  course_id,
  batch_id,
  stream_id = null,
  semester_id
) => {
  if (!semester_id) {
    return { success: false, message: "Semester ID is required" };
  }

  const assignCourseSql = `
    INSERT INTO staff_courses (user_id, course_id, batch_id, stream_id, semester_id)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE course_id = VALUES(course_id), batch_id = VALUES(batch_id), stream_id = VALUES(stream_id), semester_id = VALUES(semester_id);
  `;

  try {
    const result = await query(assignCourseSql, [
      user_id,
      course_id,
      batch_id,
      stream_id,
      semester_id,
    ]);
    return {
      success: true,
      message: "Course assigned to staff successfully",
      staffCourseId: result.insertId,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error assigning course to staff: " + error.message,
    };
  }
};

// Get all courses assigned to a staff member
const getStaffCourses = async (user_id) => {
 const getCoursesSql = `
  SELECT sc.staff_course_id, sc.course_id, c.course_name, c.course_code, sc.batch_id, b.batch_year, sc.semester_id, sc.stream_id, s.stream_name
  FROM staff_courses sc
  JOIN courses c ON sc.course_id = c.course_id
  JOIN batches b ON sc.batch_id = b.batch_id
  JOIN streams s ON sc.stream_id = s.stream_id
  WHERE sc.user_id = ?;
`;
  try {
    const rows = await query(getCoursesSql, [user_id]);

    if (rows.length === 0) {
      return {
        success: false,
        message: "No courses found for the staff member",
      };
    }

    return { success: true, courses: rows };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving staff courses: " + error.message,
    };
  }
};

// Remove a course assignment from a staff member
const removeStaffCourse = async (user_id, course_id) => {
  const deleteQuery = `DELETE FROM staff_courses WHERE user_id = ? AND course_id = ?`;

  try {
    await query(deleteQuery, [user_id, course_id]);
    return {
      success: true,
      message: "Course assignment removed from staff successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error removing course assignment: " + error.message,
    };
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  updateCourseById,
  assignCourseToStaff,
  getStaffCourses,
  removeStaffCourse,
};
