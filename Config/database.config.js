// Import the mysql2 module Promise Wrapper
const mysql = require("mysql2/promise");

require("dotenv").config();

const dbConfig = {
  connectionLimit: 10,
  socketPath: process.env.DB_SOCKET_PATH,
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
};
// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Function to check the database connection
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Optionally, you might want to exit the process if the connection fails
    process.exit(1);
  }
}

// Call the function to check the connection when the application starts
checkConnection();

// Prepare a function that will execute the SQL queries asynchronously
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

// Export the query function for use in the application
module.exports = { query, pool };
