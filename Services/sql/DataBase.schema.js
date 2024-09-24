const bcrypt = require("bcrypt");

// Roles table
const createRolesTable = `
CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE,
  description TEXT
);
`;

// Batches table (2nd, 3rd, 4th, 5th years)
const createBatchesTable = `
CREATE TABLE IF NOT EXISTS batches (
  batch_id INT AUTO_INCREMENT PRIMARY KEY,
  batch_year VARCHAR(10) UNIQUE
);
`;

// Semesters table (1st and 2nd semesters)
const createSemestersTable = `
CREATE TABLE IF NOT EXISTS semesters (
  semester_id INT AUTO_INCREMENT PRIMARY KEY,
  semester_name VARCHAR(50) UNIQUE
);
`;

// Streams table (After 4th year 1st semester, students go into different streams)
const createStreamsTable = `
CREATE TABLE IF NOT EXISTS streams (
  stream_id INT AUTO_INCREMENT PRIMARY KEY,
  stream_name VARCHAR(100) UNIQUE
);
`;

// Courses table (includes a unique course_code for identification)
const createCoursesTable = `
CREATE TABLE IF NOT EXISTS courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(100),
  course_code VARCHAR(20) UNIQUE
);
`;

// Users table (Handles all users: Students, Staff, Representatives, etc.)
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT,
  batch_id INT DEFAULT NULL,
  stream_id INT DEFAULT NULL,
  semester_id INT DEFAULT NULL,
  id_number VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE SET NULL,
  FOREIGN KEY (stream_id) REFERENCES streams(stream_id) ON DELETE SET NULL,
  FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE SET NULL
);
`;

// Students table (specific table for student data)
const createStudentsTable = `
CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  id_number VARCHAR(50) UNIQUE NOT NULL,
  stream_id INT DEFAULT NULL,
  batch_id INT DEFAULT NULL,
  role_id INT,
  FOREIGN KEY (stream_id) REFERENCES streams(stream_id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE SET NULL,
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

// Batch Courses table (Associates batches, streams, and semesters with courses)
const createBatchCoursesTable = `
CREATE TABLE IF NOT EXISTS batch_courses (
  batch_course_id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT,
  stream_id INT DEFAULT NULL,
  semester_id INT,
  course_id INT,
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  FOREIGN KEY (stream_id) REFERENCES streams(stream_id) ON DELETE SET NULL,
  FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
`;

// Staff Batches table (Associates staff with specific batches, streams, and semesters)
const createStaffBatchesTable = `
CREATE TABLE IF NOT EXISTS staff_batches (
  staff_batch_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  batch_id INT,
  stream_id INT DEFAULT NULL,
  semester_id INT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
  FOREIGN KEY (stream_id) REFERENCES streams(stream_id) ON DELETE SET NULL
);
`;

// Staff Courses table (Staff courses related to batch, stream, and semester)
const createStaffCoursesTable = `
CREATE TABLE IF NOT EXISTS staff_courses (
  staff_course_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  course_id INT,
  batch_id INT,
  stream_id INT DEFAULT NULL,
  semester_id INT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id),
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
  FOREIGN KEY (stream_id) REFERENCES streams(stream_id) ON DELETE SET NULL
);
`;

// News table (Posted by users, typically staff, department, or admin)
const createNewsTable = `
CREATE TABLE IF NOT EXISTS news (
  news_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  posted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(user_id)
);
`;

// Contacts table (Staff or department contact information)
const createContactsTable = `
CREATE TABLE IF NOT EXISTS contacts (
  contact_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  office_room VARCHAR(100),
  email VARCHAR(100),
  phone_number VARCHAR(20),
  availability TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
`;

// Materials table (Associated with batch, stream, and semester, uploaded by staff)
const createMaterialsTable = `
CREATE TABLE IF NOT EXISTS materials (
  material_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  file_url VARCHAR(255),
  batch_course_id INT,  -- References batch, stream, semester, and course from batch_courses
  uploaded_by INT,      -- Who uploaded the material (staff, representative, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_course_id) REFERENCES batch_courses(batch_course_id),
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);
`;

// Admins table (Admin users with full access)
const createAdminsTable = `
CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  role_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
`;

// Data Insertion Queries

// Insert roles
const insertRoles = `
INSERT INTO roles (role_name, description) VALUES
('Admin', 'Administrator with full access'),
('Student', 'Student role with access to educational resources'),
('Staff', 'Staff role with administrative access'),
('Department', 'Department role with administrative access'),
('Representative', 'Representative role with student access')
ON DUPLICATE KEY UPDATE description=VALUES(description);
`;

// Insert batches
const insertBatches = `
INSERT INTO batches (batch_year) VALUES 
('2nd Year'),
('3rd Year'),
('4th Year'),
('5th Year')
ON DUPLICATE KEY UPDATE batch_year=VALUES(batch_year);
`;

// Insert semesters
const insertSemesters = `
INSERT INTO semesters (semester_name) VALUES
('1st Semester'),
('2nd Semester')
ON DUPLICATE KEY UPDATE semester_name=VALUES(semester_name);
`;

// Insert streams
const insertStreams = `
INSERT INTO streams (stream_name) VALUES
('Computer'),
('Communication'),
('Control'),
('Power')
ON DUPLICATE KEY UPDATE stream_name=VALUES(stream_name);
`;

// Insert admin user with hashed password
const insertAdminUser = async () => {
  const hashedPassword = await bcrypt.hash("adminpassword", 10);

  const query = `
    INSERT INTO users (role_id, id_number, name, email, password)
    VALUES ((SELECT role_id FROM roles WHERE role_name = 'Admin'), 'admin123', 'Abdulwasie Bahredin', 'admin@gmail.com', ?)
    ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password);
  `;

  return { query, values: [hashedPassword] };
};

// Insert admin into admins table
const insertAdminIntoAdminsTable = `
INSERT INTO admins (user_id, role_id)
VALUES ((SELECT user_id FROM users WHERE email = 'admin@gmail.com'), (SELECT role_id FROM roles WHERE role_name = 'Admin'))
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);
`;

// Combine all queries into an array
const createTablesQueries = [
  createRolesTable,
  createBatchesTable,
  createSemestersTable,
  createStreamsTable,
  createCoursesTable,
  createUsersTable,
  createStudentsTable,
  createBatchCoursesTable,
  createStaffBatchesTable,
  createStaffCoursesTable,
  createNewsTable,
  createContactsTable,
  createMaterialsTable,
  createAdminsTable,
  insertRoles,
  insertBatches,
  insertSemesters,
  insertStreams,
];

module.exports = {
  createTablesQueries,
  insertAdminUser,
  insertAdminIntoAdminsTable,
};
