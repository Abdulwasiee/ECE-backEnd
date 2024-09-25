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

  const createCourseSql = `
    INSERT INTO courses (course_name, course_code) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE 
      course_name = VALUES(course_name), 
      course_code = VALUES(course_code);
  `;

  const getCourseIdSql = `SELECT course_id FROM courses WHERE course_name = ? AND course_code = ?;`;

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
    // Insert the course
    await query(createCourseSql, [courseName, courseCode]);

    // Retrieve the course ID after insertion
    const result = await query(getCourseIdSql, [courseName, courseCode]);
    const courseId = result[0]?.course_id; // Ensure courseId is valid

    if (!courseId) {
      return {
        success: false,
        message: "Course ID not found after creation.",
      };
    }

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

  let sql = `
  SELECT 
    bc.batch_course_id, 
    c.course_id, 
    c.course_name, 
    c.course_code,      
    b.batch_id, 
    b.batch_year,
    s.stream_name,
    sem.semester_id,
    sem.semester_name
  FROM 
    batch_courses bc
  LEFT JOIN 
    courses c ON bc.course_id = c.course_id
  LEFT JOIN 
    batches b ON bc.batch_id = b.batch_id
  LEFT JOIN 
    streams s ON bc.stream_id = s.stream_id
  LEFT JOIN
    semesters sem ON bc.semester_id = sem.semester_id
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
const assignCourseToStaff = async (user_id, batch_course_id) => {
  // Step 1: Fetch the course details from the batch_courses table
  const fetchCourseDetailsSql = `
    SELECT course_id, batch_id, stream_id, semester_id
    FROM batch_courses
    WHERE batch_course_id = ?;
  `;

  try {
    const courseDetails = await query(fetchCourseDetailsSql, [batch_course_id]);

    // Check if course details were found
    if (courseDetails.length === 0) {
      return {
        success: false,
        message: "No course found with the provided batch_course_id.",
      };
    }

    // Destructure the first (and only) result from the query
    const { course_id, batch_id, stream_id, semester_id } = courseDetails[0];

    // Step 2: Insert into staff_courses table
    const assignCourseSql = `
      INSERT INTO staff_courses (user_id, course_id, batch_id, stream_id, semester_id)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE course_id = VALUES(course_id), batch_id = VALUES(batch_id), stream_id = VALUES(stream_id), semester_id = VALUES(semester_id);
    `;

    const result = await query(assignCourseSql, [
      user_id,
      course_id,
      batch_id,
      stream_id,
      semester_id,
    ]);

    // Step 3: Insert into staff_batches table
    const assignBatchSql = `
      INSERT INTO staff_batches (user_id, batch_id, stream_id, semester_id)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE stream_id = VALUES(stream_id), semester_id = VALUES(semester_id);
    `;

    await query(assignBatchSql, [user_id, batch_id, stream_id, semester_id]);

    return {
      success: true,
      message: "Course to staff successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error assigning course to staff: " + error.message,
    };
  }
};

const getStaffCourses = async (user_id) => {
  const getCoursesSql = `
SELECT 
  sc.staff_course_id, 
  sc.course_id, 
  c.course_name, 
  c.course_code, 
  bc.batch_course_id, 
  sc.batch_id, 
  b.batch_year, 
  sc.semester_id, 
  sc.stream_id, 
  IFNULL(s.stream_name, 'N/A') AS stream_name
FROM 
  staff_courses sc
JOIN 
  courses c ON sc.course_id = c.course_id
JOIN 
  batches b ON sc.batch_id = b.batch_id
LEFT JOIN 
  batch_courses bc 
    ON sc.batch_id = bc.batch_id 
    AND sc.semester_id = bc.semester_id 
    AND sc.course_id = bc.course_id
    AND (sc.stream_id = bc.stream_id OR (sc.stream_id IS NULL AND bc.stream_id IS NULL))
LEFT JOIN 
  streams s ON sc.stream_id = s.stream_id
WHERE 
  sc.user_id = ?;
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
