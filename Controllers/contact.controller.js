const contactService = require("../Services/contact.service");

// Controller function to handle adding contact information
const addContact = async (req, res) => {
  const { user_id } = req.user;
  const contactInfo = req.body;

  try {
    const result = await contactService.addContactInformation(
      user_id,
      contactInfo
    );
    return res.json({
      result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Controller to get important contact information with user's name
const getContactInformation = async (req, res) => {
  let userId;
  if (req.user.role_id == 3) {
    userId = req.user.user_id;
  } else {
    userId = req.params.userId;
  }

  try {
    const result = await contactService.getContactInfo(userId);
    return res.json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};
// Controller to update contact information for a user
const updateContactInfo = async (req, res) => {
  const { userId } = req.params;
  const contactInfo = req.body;

  try {
    const result = await contactService.updateContactInformation(
      userId,
      contactInfo
    );

    return res.json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};

// Controller function to delete contact information by userId
const deleteContactInfo = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  try {
    const result = await contactService.deleteContactInformation(userId);

    return res.json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};
module.exports = {
  getContactInformation,
  addContact,
  updateContactInfo,
  deleteContactInfo,
};
