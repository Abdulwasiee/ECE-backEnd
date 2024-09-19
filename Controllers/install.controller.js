// controllers/install.controller.js
const { installation } = require("../Services/install.service");

const install = async (req, res) => {
  try {
    const result = await installation(); // Call the service to perform installation

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Database installation failed.", error: error.message });
  }
};

module.exports = { install };
