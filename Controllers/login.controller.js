const { loginService,studentLoginService } = require("../Services/login.service");

const loginController = async (req, res) => {
  const loginData = req.body;

  try {
    const response = await loginService(loginData);
    return response.json({
      response,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const studentLoginController = async (req, res) => {
  const loginData = req.body;

  try {
    const response = await studentLoginService(loginData);
    return res.json({
      response,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginController,
  studentLoginController,
};
