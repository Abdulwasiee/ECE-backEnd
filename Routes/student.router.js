const express = require("express");
const router = express.Router();
const studentController = require("../Controllers/student.controller");
const { authMiddleware } = require("../Middlewire/Auth");

// router to register a student
router.post("/api/student/register", studentController.addStudent);

// router to get a list of students
router.get(
  "/api/students/:batch_id",
  authMiddleware([1, 4, 5]),
  studentController.getStudentsByBatch
);


// router to delete a student's information
router.delete(
  "/api/student/:student_id",
  authMiddleware([1, 2, 4, 5]),
  studentController.deleteStudent
);

module.exports = router;
