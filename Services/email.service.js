const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from .env

// Email service to send user creation email
const sendEmail = async (userFirstName, userEmail, userPassword, role_id) => {
  try {
    // Create transporter for sending email
    let transporter = nodemailer.createTransport({
      service: "gmail", // You can use another email service like Outlook or Yahoo
      auth: {
        user: process.env.ADMIN_EMAIL, // Admin email address
        pass: process.env.ADMIN_EMAIL_PASSWORD, // Admin email password from .env
      },
    });

    // Define the role description
    let roleDescription = "";
    if (role_id == 3) {
      roleDescription = "You have been assigned as a Staff member.";
    } else if (role_id == 4) {
      roleDescription = "You are a Department Admin.";
    } else if (role_id == 5) {
      roleDescription = "You are a Representative.";
    }

    // Define mail options
    let mailOptions = {
      from: process.env.ADMIN_EMAIL, // Admin's email address
      to: userEmail, // New user's email address
      subject: "Welcome to the ECE Department at Hawassa University", // Email subject
      text: `Hello ${userFirstName},

Welcome to the Electrical and Computer Engineering (ECE) department at Hawassa University!

Your account has been created. ${roleDescription} You can now access the department's Website using the following credentials:

Email: ${userEmail}
Password: ${userPassword}
You can change your password after login and navigate to the profile page.

Please log in to the system at the following website: http://electrical.et.hu.com.


Regards,
ECE Department,
Hawassa University`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Handle error
  }
};

module.exports = { sendEmail };
