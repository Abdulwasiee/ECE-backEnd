const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from .env

// Email service to send user creation email
const sendEmail = async (
  userFirstName,
  userEmail,
  userPassword,
  role_id,
  assignedCourse,
  batchYear,
  stream
) => {


  try {
    // Create transporter for sending email
    let transporter = nodemailer.createTransport({
      service: "gmail", // You can use another email service like Outlook or Yahoo
      auth: {
        user: process.env.ADMIN_EMAIL, // Admin email address
        pass: process.env.ADMIN_EMAIL_PASSWORD, // Admin email password from .env
      },
    });

    // Define the role description and additional info
    let roleDescription = "";
    let additionalInfo = "";

    if (role_id == 3) {
      roleDescription = "You have been assigned as a Staff member.";
      additionalInfo = `You have been assigned to the course: ${
        assignedCourse.course_name
      } (${assignedCourse.course_code}).
                        Batch Year: ${batchYear}.
                        ${stream ? `Stream: ${stream.stream_name}.` : ""}`;
    } else if (role_id == 4) {
      roleDescription = "You are a Department Admin.";
    } else if (role_id == 5) {
      roleDescription = "You are a Representative.";
      additionalInfo = `Batch Year: ${batchYear}. 
                        ${stream ? `Stream: ${stream.stream_name}.` : ""}`;
    }

    // Define mail options for user creation email
    let mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: userEmail, // New user's email address
      subject: "Welcome to the ECE Department at Hawassa University",
      text: `Hello ${userFirstName},

Welcome to the Electrical and Computer Engineering (ECE) department at Hawassa University!

Your account has been created. ${roleDescription} ${additionalInfo} You can now access the department's Website using the following credentials:

Email: ${userEmail}
Password: ${userPassword}
You can change your password after login and navigate to the profile page.

Please log in to the system at the following website: http://electrical.et.hu.com.

Regards,
ECE Department,
Hawassa University`,
    };

    // Send the email for user creation
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Handle error
  }
};

// New function to send assignment notification email
const sendAssignmentEmail = async (
  userFirstName,
  userEmail,
  assignedCourse,
  batchYear,
  stream
) => {
  try {
    // Create transporter for sending email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
      },
    });

    // Define mail options for assignment notification
    let mailOptions = {
      from: process.env.ADMIN_EMAIL, // Admin's email address
      to: userEmail, // User's email address
      subject: "Course Assignment Notification",
      text: `Hello ${userFirstName},

You have been assigned a new course in the Electrical and Computer Engineering (ECE) department at Hawassa University!

Course: ${assignedCourse.course_name} (${assignedCourse.course_code})
Batch Year: ${batchYear}
${stream ? `Stream: ${stream}.` : "No stream assigned."}

Please ensure you review the course details and get in touch if you have any questions.

Regards,
ECE Department,
Hawassa University`,
    };

    // Send the assignment notification email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending assignment email:", error);
    throw error;
  }
};
// Email service to send password reset email
const sendPasswordResetEmail = async (userEmail, resetLink) => {
  try {
    // Create transporter for sending email
    let transporter = nodemailer.createTransport({
      service: "gmail", // Use another email service if needed (e.g., Outlook, Yahoo)
      auth: {
        user: process.env.ADMIN_EMAIL, // Admin email address
        pass: process.env.ADMIN_EMAIL_PASSWORD, // Admin email password from .env
      },
    });

    // Define mail options for password reset email
    let mailOptions = {
      from: process.env.ADMIN_EMAIL, // Admin's email address
      to: userEmail, // User's email address
      subject: "Password Reset Request",
      text: `Hello,

We received a request to reset your password. You can reset your password by clicking the link below:

${resetLink}

This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.

Regards,
ECE Department,
Hawassa University`,
    };

    // Send the password reset email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};


module.exports = { sendEmail, sendAssignmentEmail , sendPasswordResetEmail};
