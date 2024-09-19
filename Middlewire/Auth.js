const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwt_secret_key = process.env.SECRET_KEY;

// Middleware to authenticate and authorize users based on their roles
const authMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided.",
      });
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    try {
      // Verify the token using the secret key
      const decoded = jwt.verify(token, jwt_secret_key);
      req.user = decoded;

      // Check role permissions if requiredRoles are specified
      if (requiredRoles.length && !requiredRoles.includes(decoded.role_id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied.",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error); // Log error for debugging
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token.",
        error: error.message,
      });
    }
  };
};

const checkAuthStatus = (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ authenticated: false, message: "No token provided" });
    }
    // Verify token
    jwt.verify(token, jwt_secret_key, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ authenticated: false, message: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res
      .status(500)
      .json({ authenticated: false, message: "Authentication failed", error });
  }
};
module.exports = { authMiddleware, checkAuthStatus };
