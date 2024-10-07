const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  uploadFile,
  deleteFile,
  getMaterials,
} = require("../Controllers/material.controller");
const { authMiddleware } = require("../Middlewire/Auth");

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define routes with multer middleware
router.post(
  "/api/uploadFile",
  authMiddleware([1, 3, 4, 5]),
  upload.single("file"),
  uploadFile
);

// router to delet the uploaded file 
router.delete("/api/deleteFile", authMiddleware([1, 3, 4, 5]), deleteFile);

// router to get all materials for a course
router.get(
  "/api/materials/:courseId",
  authMiddleware([1, 2, 3, 4, 5]),
  getMaterials
);

module.exports = router;
