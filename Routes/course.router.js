const express = require("express");
const router = express.Router();
const courseController = require("../Controllers/course.conroller");
const { authMiddleware } = require("../Middlewire/Auth");

router.post(
  "/api/addCourse",
  authMiddleware([1,4]),
  courseController.createCourse
);
router.put(
  "/api/updateCourse/:courseId",
  authMiddleware([1, 4]),
  courseController.updateCourseById
);

router.get(
  "/api/getCourses/:batch_id",
  authMiddleware([1, 2, 3, 4, 5]),
  courseController.getAllCourses
);

router.post(
  "/api/assignStaff",
  authMiddleware([1, 4]),
  courseController.assignCourseToStaff
);
router.get(
  "/api/getStaffCourse",
  authMiddleware([1, 2, 3, 4, 5]),
  courseController.getStaffCourses
);
router.delete(
  "/api/removeStaffCourse",
  authMiddleware([1, 4]),
  courseController.removeStaffCourse
);

module.exports = router;
