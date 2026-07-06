var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authorize, checkRole } = require("../middleware/token.middleware");
const userSchema = require("../models/user.model");
const { sendResponse } = require("../utils/response");

const isBadRequestError = (error) => {
  return (
    error?.name === "ValidationError" ||
    error?.name === "CastError" ||
    error?.code === 11000
  );
};

const registerRoles = ["user", "merchant"];
const getApprovalMessage = (user) => {
  return user.role === "merchant" && !user.is_approved
    ? "waiting approve"
    : "success";
};

/* GET users listing. */
router.get("/users", async function (req, res, next) {
  try {
    let users = await userSchema.find({});
    return sendResponse(res, 200, "success", users);
  } catch (error) {
    return sendResponse(res, 500, error.message || "error", []);
  }
});

router.post("/register", async function (req, res, next) {
  try {
    let { username, password, role } = req.body;
    if (!username || !password) {
      return sendResponse(res, 400, "username and password are required", null);
    }

    let registerRole = role || "user";
    if (!registerRoles.includes(registerRole)) {
      return sendResponse(res, 400, "role must be user or merchant", null);
    }

    let user = new userSchema({
      username: username,
      password: await bcrypt.hash(password, 10),
      role: registerRole,
      is_approved: registerRole === "user",
    });
    await user.save();
    return sendResponse(res, 201, getApprovalMessage(user), user);
  } catch (error) {
    let status = isBadRequestError(error) ? 400 : 500;
    return sendResponse(res, status, error.message || "error", null);
  }
});

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return sendResponse(res, 400, "username and password are required", null);
    }

    let user = await userSchema.findOne({ username });
    if (!user) {
      return sendResponse(res, 400, "User not found", null);
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, "Invalid password or username", null);
    }

    let token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return sendResponse(res, 200, getApprovalMessage(user), {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        is_approved: user.is_approved,
      },
      token,
    });
  } catch (error) {
    return sendResponse(res, 500, error.message || "error", null);
  }
});

router.put(
  "/:id/approve",
  authorize,
  checkRole(["admin"]),
  async function (req, res, next) {
    try {
      let { id } = req.params;
      let user = await userSchema.findByIdAndUpdate(
        id,
        { is_approved: true },
        { new: true },
      );
      if (!user) {
        return sendResponse(res, 400, "User not found", null);
      }
      return sendResponse(res, 200, "success", user);
    } catch (error) {
      let status = isBadRequestError(error) ? 400 : 500;
      return sendResponse(res, status, error.message || "error", null);
    }
  },
);

router.delete("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let user = await userSchema.findByIdAndDelete(id);
    if (!user) {
      return sendResponse(res, 400, "User not found", null);
    }
    return sendResponse(res, 200, "success", user);
  } catch (error) {
    let status = isBadRequestError(error) ? 400 : 500;
    return sendResponse(res, status, error.message || "error", null);
  }
});
module.exports = router;
