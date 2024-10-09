const { query } = require("../Config/database.config");
const { sendAssignmentEmail } = require("./email.service");

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

    // Filter unique courses based on course name and code
    const uniqueCourses = Array.from(
      new Map(
        courses.map((course) => [
          `${course.course_name}-${course.course_code}`,
          course,
        ])
      ).values()
    );

    return { success: true, courses: uniqueCourses };
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
  UPDATE batch_courses
  SET batch_id = ?, stream_id = ?, semester_id = ?
  WHERE course_id = ?;
`;

  try {
    // Update the course name and code
    await query(updateCourseSql, [courseName, courseCode, courseId]);

    // Update the batch_courses table with the new details
    await query(updateBatchCourseSql, [
      batchId,
      streamId,
      semesterId,
      courseId,
    ]);

    return { success: true, message: "Course updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Error updating course: " + error.message,
    };
  }
};

const getCourseById = async (courseId) => {
  let sql = `
  SELECT 
    c.course_id, 
    c.course_name, 
    c.course_code, 
    b.batch_id, 
    b.batch_year,
    s.stream_name,
    sem.semester_id,
    sem.semester_name
  FROM 
    courses c
  LEFT JOIN 
    batch_courses bc ON c.course_id = bc.course_id
  LEFT JOIN 
    batches b ON bc.batch_id = b.batch_id
  LEFT JOIN 
    streams s ON bc.stream_id = s.stream_id
  LEFT JOIN 
    semesters sem ON bc.semester_id = sem.semester_id
  WHERE 
    c.course_id = ?
`;

  try {
    const course = await query(sql, [courseId]);

    // Check if a course was found
    if (course.length === 0) {
      return {
        success: true,
        course: null,
        message: "Course not found",
      };
    }

    return { success: true, course: course[0] };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving course: " + error.message,
    };
  }
};

const assignCourseToStaff = async (user_id, batch_course_id) => {
  // Step 1: Fetch the course details from the batch_courses table
  const fetchCourseDetailsSql = `
    SELECT bc.course_id, bc.batch_id, bc.stream_id, bc.semester_id, c.course_name, c.course_code
    FROM batch_courses bc
    JOIN courses c ON bc.course_id = c.course_id
    WHERE bc.batch_course_id = ?;
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
    const {
      course_id,
      batch_id,
      stream_id,
      semester_id,
      course_name,
      course_code,
    } = courseDetails[0];

    // Insert into staff_courses table
    const assignCourseSql = `
      INSERT INTO staff_courses (user_id, course_id, batch_id, stream_id, semester_id)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE course_id = VALUES(course_id), batch_id = VALUES(batch_id), stream_id = VALUES(stream_id), semester_id = VALUES(semester_id);
    `;
    await query(assignCourseSql, [
      user_id,
      course_id,
      batch_id,
      stream_id,
      semester_id,
    ]);

    //  Insert into staff_batches table
    const assignBatchSql = `
      INSERT INTO staff_batches (user_id, batch_id, stream_id, semester_id)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE stream_id = VALUES(stream_id), semester_id = VALUES(semester_id);
    `;
    await query(assignBatchSql, [user_id, batch_id, stream_id, semester_id]);

    //  Fetch user details for the email
    const fetchUserSql = `SELECT name, email FROM users WHERE user_id = ?`;
    const user = await query(fetchUserSql, [user_id]);

    if (user.length === 0) {
      return {
        success: false,
        message: "User not found for the provided user_id.",
      };
    }

    const { name, email } = user[0];

    //  Fetch batch year and stream name for the email
    const batchYearSql = `SELECT batch_year FROM batches WHERE batch_id = ?`;
    const streamNameSql = `SELECT stream_name FROM streams WHERE stream_id = ?`;

    const batchYear = await query(batchYearSql, [batch_id]);
    const streamName = await query(streamNameSql, [stream_id]);

    //  Send assignment email
    try {
      await sendAssignmentEmail(
        name,
        email,
        { course_name, course_code },
        batchYear[0]?.batch_year,
        streamName[0]?.stream_name || null
      );
    } catch (emailError) {
      console.error("Error sending assignment email:", emailError);
      return {
        success: true,
        message: "Course assigned to staff, but email failed to send.",
      };
    }

    return {
      success: true,
      message: "Course assigned to staff successfully, and email sent.",
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

    const uniqueCourses = rows.filter(
      (course, index, self) =>
        index ===
        self.findIndex(
          (c) =>
            c.batch_id === course.batch_id &&
            c.course_name === course.course_name &&
            c.semester_id === course.semester_id
        )
    );

    return { success: true, courses: uniqueCourses };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving staff courses: " + error.message,
    };
  }
};

const removeStaffCourse = async (user_id, course_id) => {
  const fetchDetailsSql = `
    SELECT batch_id, stream_id, semester_id
    FROM staff_courses
    WHERE user_id = ? AND course_id = ?;
  `;

  const deleteStaffCoursesSql = `
    DELETE FROM staff_courses WHERE user_id = ? AND course_id = ?;
  `;

  const checkAssignmentsSql = `
    SELECT COUNT(*) as count
    FROM staff_courses
    WHERE course_id = ?;
  `;

  const deleteBatchCourseSql = `
    DELETE FROM batch_courses 
    WHERE batch_id = ? AND stream_id = ? AND semester_id = ? AND course_id = ?;
  `;

  const deleteStaffBatchSql = `
    DELETE FROM staff_batches
    WHERE user_id = ? AND batch_id = ? AND semester_id = ?;
  `;

  try {
    // Fetch batch, stream, and semester details
    const courseDetails = await query(fetchDetailsSql, [user_id, course_id]);
    if (!courseDetails || courseDetails.length === 0) {
      return { success: false, message: "No course assignment found." };
    }

    // Destructure with default values
    const {
      batch_id = null,
      stream_id = null,
      semester_id = null,
    } = courseDetails[0];

    // Delete from staff_courses
    await query(deleteStaffCoursesSql, [user_id, course_id]);

    // Check if other staff are assigned to this course
    const countResult = await query(checkAssignmentsSql, [course_id]);

    // If no other staff is assigned, delete from batch_courses
    if (countResult && countResult[0].count === 0) {
      await query(deleteBatchCourseSql, [
        batch_id,
        stream_id,
        semester_id,
        course_id,
      ]);
    }

    // Delete from staff_batches for the current user
    await query(deleteStaffBatchSql, [user_id, batch_id, semester_id]);

    return {
      success: true,
      message: "Course assignment and related data removed successfully.",
    };
  } catch (error) {
    console.error("Error removing course assignment:", error);
    return {
      success: false,
      message: "Error removing course assignment: " + error.message,
    };
  }
};
module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
  assignCourseToStaff,
  getStaffCourses,
  removeStaffCourse,
};
