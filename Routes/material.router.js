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
  authMiddleware([1, 3, 5]),
  upload.single("file"),
  uploadFile
);
router.delete("/api/deleteFile", authMiddleware([1, 3, 5]), deleteFile);
router.get(
  "/api/materials/:courseId",
  authMiddleware([1, 2, 3, 5]),
  getMaterials
);

module.exports = router;
