const { query } = require("../Config/database.config");

const addContactInformation = async (userId, contactInfo) => {
  const { office_room, phone_number, availability } = contactInfo;

  // Validate the input fields
  if (!office_room || !phone_number || !availability) {
    return {
      status: "error",
      message: "Missing required fields",
    };
  }
  let email = null;

  try {
    // Step 2: Insert or update the contact information
    const insertOrUpdateQuery = `
      INSERT INTO contacts (user_id, office_room, email, phone_number, availability)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE office_room = VALUES(office_room), email = VALUES(email), phone_number = VALUES(phone_number), availability = VALUES(availability);
    `;

    const result = await query(insertOrUpdateQuery, [
      userId,
      office_room,
      email,
      phone_number,
      availability,
    ]);

    return {
      success: true,
      message: "Contact information added successfully",
      contactId: result.insertId,
    };
  } catch (error) {
    console.error("Error details:", error); // Log error details for debugging
    return {
      success: false,
      message: "Error adding contact information: " + error.message,
    };
  }
};

// Service to fetch important contact information along with the user's name
const getContactInfo = async (userId) => {
  const getContactsQuery = `
    SELECT u.name,u.user_id, c.office_room, c.phone_number, c.availability
    FROM contacts c
    JOIN users u ON c.user_id = u.user_id
    WHERE u.user_id = ?
  `;

  try {
    // Pass the userId as an array to the query function
    const contactRows = await query(getContactsQuery, [userId]);

    if (contactRows.length === 0) {
      return {
        success: false,
        contactRows,
        message: "No contact information found",
      };
    }

    return {
      success: true,
      contactRows,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching contact information: " + error.message,
    };
  }
};

// Service to update contact information
const updateContactInformation = async (userId, contactInfo) => {
  const { office_room, phone_number, availability, email } = contactInfo;

  // Validate the input fields
  if (!office_room || !phone_number || !availability || !email) {
    return {
      status: "error",
      message: "Missing required fields",
    };
  }

  try {
    const updateQuery = `
      UPDATE contacts 
      SET office_room = ?, phone_number = ?, availability = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?;
    `;

    await query(updateQuery, [
      office_room,
      phone_number,
      availability,
      email,
      userId,
    ]);

    return {
      success: true,
      message: "Contact information updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating contact information: " + error.message,
    };
  }
};

// Service to delete contact information
const deleteContactInformation = async (userId) => {
  try {
    // Delete the contact information
    const deleteQuery = `DELETE FROM contacts WHERE user_id = ?`;
    await query(deleteQuery, [userId]);

    return {
      success: true,
      message: "Contact information deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error deleting contact information: " + error.message,
    };
  }
};

module.exports = {
  deleteContactInformation,
  addContactInformation,
  getContactInfo,
  updateContactInformation,
};
