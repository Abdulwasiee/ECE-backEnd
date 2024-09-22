const courseService = require("../Services/course.service");

// Create a new course
const createCourse = async (req, res) => {
  const { course_name, course_code, semesterId, streamId } = req.body;
  let batch_id;
  let finalStreamId = streamId;

  if (req.user.role_id === 5) {
    batch_id = req.user.batch_ids[0];
    if (req.user.stream_id) {
      finalStreamId = req.user.stream_id;
    }
  } else {
    batch_id = req.body.batch_id;
  }

  const result = await courseService.createCourse(
    course_name,
    course_code,
    batch_id,
    semesterId,
    finalStreamId
  );

  return res.json({
    result,
  });
};
// Get all courses
const getAllCourses = async (req, res) => {
  let batch_id;
  console.log(req.user)
  if (req.user.role_id === 5 || req.user.role_id === 2) {
    batch_id = req.user.batch_ids[0];
  } else {
    batch_id = req.params.batch_id;
  }
  const { semester_id, stream_id } = req.query;
  console.log(batch_id)
  console.log(req.query)
  const result = await courseService.getAllCourses(
    batch_id,
    semester_id,
    stream_id
  );
  return res.json({
    result,
  });
};

// Update a course by ID
const updateCourseById = async (req, res) => {
  const { courseId } = req.params;
  const { course_name, course_code, streamId, semesterId } = req.body; // Added course_code
  let batch_id;

  if (req.user.role_id === 5) {
    batch_id = req.user.batch_id;
  } else {
    batch_id = req.query.batch_id;
  }

  const result = await courseService.updateCourseById(
    courseId,
    course_name,
    course_code,
    batch_id,
    streamId,
    semesterId
  );
  return res.json({
    result,
  });
};

// Controller to assign a course to a staff member
const assignCourseToStaff = async (req, res) => {
  const { user_id, course_id, semester_id, stream_id } = req.body; // Added semester_id and stream_id
  let batch_id;

  if (req.user.role_id === 5) {
    batch_id = req.user.batch_id;
  } else {
    batch_id = req.body.batch_id;
  }

  if (!user_id || !course_id || !semester_id) {
    // Semester ID is required
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  try {
    const result = await courseService.assignCourseToStaff(
      user_id,
      course_id,
      batch_id,
      stream_id, // Optional
      semester_id
    );
    return res.json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all courses assigned to a staff member
const getStaffCourses = async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await courseService.getStaffCourses(user_id);
    return res.json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Controller to remove a course assignment for a staff member
const removeStaffCourse = async (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  try {
    const result = await courseService.removeStaffCourse(user_id, course_id);
    return res.json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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
