const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../Config/aws.config");
const { query } = require("../Config/database.config");
require("dotenv").config();

// Helper function for validation
const validateParams = (params) => {
  return params.every(
    (param) => param !== null && param !== undefined && param !== ""
  );
};

// Upload file to AWS S3 with a custom title
const uploadFileToS3 = async (file, title) => {
  if (!validateParams([file, title])) {
    throw new Error("Invalid file or title");
  }

  // Determine the correct MIME type for the file
  const contentType = file.mimetype || "application/octet-stream";

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: title, // Custom file name (including extension)
    Body: file.buffer, // Use file.buffer for in-memory file uploads
    ContentType: contentType, // Ensure correct MIME type is set
  };

  try {
    const command = new PutObjectCommand(params);
    const uploadResult = await s3Client.send(command);
    return uploadResult;
  } catch (error) {
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

// Delete file from AWS S3
const deleteFileFromS3 = async (fileKey) => {
  if (!fileKey) {
    throw new Error("Invalid file key");
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey, // Key is the name of the file
  };

  try {
    const command = new DeleteObjectCommand(params);
    const deleteResult = await s3Client.send(command);
    return deleteResult;
  } catch (error) {
    console.error("Delete Error:", error); // More detailed logging
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

// Update file in AWS S3
const updateFileInS3 = async (oldFileKey, newFile, newTitle) => {
  if (!validateParams([oldFileKey, newFile, newTitle])) {
    throw new Error("Invalid input for file update");
  }

  try {
    // First delete the old file
    await deleteFileFromS3(oldFileKey);

    // Then upload the new file with the new title
    const uploadResult = await uploadFileToS3(newFile, newTitle);
    return uploadResult;
  } catch (error) {
    console.error("Update Error:", error); // More detailed logging
    throw new Error(`Failed to update file in S3: ${error.message}`);
  }
};

// Save file URL and title in the database
const saveMaterialToDB = async (title, fileUrl, batchCourseId, uploadedBy) => {
  console.log(title, fileUrl, batchCourseId, uploadedBy);
  if (!validateParams([title, fileUrl, batchCourseId, uploadedBy])) {
    throw new Error("Invalid material data for saving");
  }

  const sqlQuery = `
    INSERT INTO materials (title, file_url, batch_course_id, uploaded_by)
    VALUES (?, ?, ?, ?)
  `;

  try {
    await query(sqlQuery, [title, fileUrl, batchCourseId, uploadedBy]);
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error(`Failed to save material to database: ${error.message}`);
  }
};

// Delete material entry from the database
const deleteMaterialFromDB = async (materialId) => {
  if (!materialId) {
    throw new Error("Invalid material ID for deletion");
  }

  const sqlQuery = `
    DELETE FROM materials WHERE material_id = ?
  `;

  try {
    await query(sqlQuery, [materialId]);
    return { success: true, message: "Material deleted successfully" };
  } catch (error) {
    console.error("Delete Material Error:", error); // More detailed logging
    throw new Error(
      `Failed to delete material from database: ${error.message}`
    );
  }
};

// Fetch materials based only on batch course ID
const getMaterialsByBatchCourseId = async (batchCourseId) => {
  console.log(batchCourseId)
  // Base SQL query
  const sqlQuery = `
    SELECT 
      m.material_id, 
      m.title, 
      m.file_url, 
      m.batch_course_id, 
      m.created_at, 
      m.updated_at, 
      u.name AS uploaded_by
    FROM materials m
    JOIN users u ON m.uploaded_by = u.user_id
    WHERE m.batch_course_id = ?
  `;

  try {
    const result = await query(sqlQuery, [batchCourseId]);

    if (result.length === 0) {
      // No materials found
      return {
        success: false,
        result,
        message: "No materials found",
      };
    }

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Fetch Materials Error:", error); // More detailed logging
    return {
      success: false,
      message: `Failed to fetch materials: ${error.message}`,
    };
  }
};

module.exports = {
  uploadFileToS3,
  deleteFileFromS3,
  updateFileInS3,
  saveMaterialToDB,
  deleteMaterialFromDB,
  getMaterialsByBatchCourseId,
};
