const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response");

const authorize = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, 401, "Token required");
    }

    let token = authHeader.split(" ")[1];
    let secretKey = process.env.JWT_SECRET;
    let decoded = jwt.verify(token, secretKey, {
      algorithms: ["HS256"],
    });
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, 401, error.message || "Invalid token");
  }
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return sendResponse(res, 401, "Token required");
      }

      let { role } = req.user;
      if (!roles.includes(role)) {
        return sendResponse(res, 401, "Forbidden");
      }
      next();
    } catch (error) {
      return sendResponse(res, 500, error.message || "error");
    }
  };
};

module.exports = { authorize, checkRole };
