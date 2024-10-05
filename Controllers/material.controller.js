const { decrypt } = require("../Services/decyptor.service");
const {
  uploadFileToS3,
  deleteFileFromS3,
  saveMaterialToDB,
  deleteMaterialFromDB,
  getMaterialsByBatchCourseId,
} = require("../Services/material.service");

const uploadFile = async (req, res) => {
  try {
    const { title, batchCourseId } = req.body;
    const materialBatchCourseId = decrypt(batchCourseId);

    const uploadedBy = req.user.user_id;
    if (!title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload the file to S3
    const uploadResult = await uploadFileToS3(file, title);

    // Construct the file URL from the S3 upload result
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${title}`;

    // Save file details to the database
    await saveMaterialToDB(title, fileUrl, materialBatchCourseId, uploadedBy);

    return res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Controller to handle file deletion
const deleteFile = async (req, res) => {
  try {
    const { materialId, fileKey } = req.body;

    if (!materialId || !fileKey) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Delete the file from S3
    await deleteFileFromS3(fileKey);

    // Delete the material from the database
    await deleteMaterialFromDB(materialId);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Controller to fetch materials by batchCourseId
const getMaterials = async (req, res) => {
  try {
    let { courseId } = req.params;

    const decryptedId = decrypt(courseId);
    const materials = await getMaterialsByBatchCourseId(decryptedId);

    if (materials.length === 0) {
      return res.status(404).json({ message: "No materials found" });
    }

    return res.status(200).json({ data: materials });
  } catch (error) {
    console.error("Error fetching materials:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getMaterials,
};
