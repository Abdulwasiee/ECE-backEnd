require("dotenv").config();
const s3Client = require("./Config/aws.config");

// Import the express module
const express = require("express");

// Import the CORS module
const cors = require("cors");

// Import the AWS S3 configuration
const { ListBucketsCommand } = require("@aws-sdk/client-s3");

// Import the router
const router = require("./Routes");

// Set up the CORS options to allow requests from our front-end
const corsOptions = {
  origin: "*", // Allows requests from any origin
  optionsSuccessStatus: 200, // For legacy browser support
};

// Create the webserver
const app = express();

// Add the CORS middleware with options
app.use(cors(corsOptions));

// Add the express.json middleware to the application
app.use(express.json());

// Add the routes to the application as middleware
app.use(router);

// Define the port from environment variables
const port = process.env.PORT;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Test AWS S3 connection
const testS3Connection = async () => {
  try {
    const command = new ListBucketsCommand({});
    const result = await s3Client.send(command);
    console.log("S3 Connection Successful. Buckets:", result.Buckets);
  } catch (error) {
    console.error("S3 Connection Failed:", error.message);
  }
};

testS3Connection(); // Call the function to test the connection

module.exports = app;
