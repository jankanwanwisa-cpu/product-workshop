const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        status: 401,
        message: "Token required",
      });
    }

    let token = authHeader.split(" ")[1];
    let decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({
      status: 401,
      message: error.message || "Invalid token",
    });
  }
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).send({
          status: 401,
          message: "Token required",
        });
      }

      let { role } = req.user;
      if (!roles.includes(role)) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }
      next();
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: error.message,
      });
    }
  };
};

module.exports = { authorize, checkRole };
