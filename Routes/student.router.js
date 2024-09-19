const express = require("express");
const router = express.Router();
const studentController = require("../Controllers/student.controller");
const { authMiddleware } = require("../Middlewire/Auth");

router.post("/api/student/register", studentController.addStudent);
router.get(
  "/api/students/:batch_id",
  authMiddleware([1, 5]),
  studentController.getStudentsByBatch
);

router.delete(
  "/api/student/:student_id",
  authMiddleware([1, 5]),
  studentController.deleteStudent
);

module.exports = router;
