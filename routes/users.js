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

const registerRoles = ["user", "merchant", "admin"];
const getApprovalMessage = (user) => {
  return user.role === "merchant" && !user.is_approved
    ? "รออนุมัติ"
    : "สำเร็จ";
};

/* GET users listing. */
router.get("/users", authorize, checkRole(["admin"]), async function (req, res, next) {
  try {
    let users = await userSchema.find({});
    return sendResponse(res, 200, "สำเร็จ", users);
  } catch (error) {
    return sendResponse(res, 500, error.message || "ไม่ทราบสาเหตุ", null);
  }
});

router.post("/register", async function (req, res, next) {
  try {
    let { username, password, role } = req.body;
    if (!username || !password) {
      return sendResponse(res, 400, "ชื่อผู้ใช้และรหัสผ่านจำเป็นต้องระบุ", null);
    }

    let registerRole = role || "user";
    if (!registerRoles.includes(registerRole)) {
      return sendResponse(res, 400, "role ต้องเป็น user หรือ merchant หรือ admin", null);
    }

    let user = new userSchema({
      username: username,
      password: await bcrypt.hash(password, 10),
      role: registerRole,
      is_approved: registerRole === "user" || registerRole === "admin",
    });
    await user.save();
    return sendResponse(res, 201, getApprovalMessage(user), user);
  } catch (error) {
    let status = isBadRequestError(error) ? 400 : 500;
    let message = error.message || "ไม่ทราบสาเหตุ";
    if (error?.code === 11000) {
      message = "ชื่อผู้ใช้นี้มีอยู่แล้ว";
    }
    return sendResponse(res, status, message, null);
  }
});

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return sendResponse(res, 400, "ชื่อผู้ใช้และรหัสผ่านจำเป็นต้องระบุ", null);
    }

    let user = await userSchema.findOne({ username });
    if (!user) {
      return sendResponse(res, 400, "ไม่พบผู้ใช้", null);
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", null);
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
    return sendResponse(res, 500, error.message || "ไม่ทราบสาเหตุ", null);
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
        return sendResponse(res, 400, "ไม่พบผู้ใช้", null);
      }
      return sendResponse(res, 200, "สำเร็จ", user);
    } catch (error) {
      let status = isBadRequestError(error) ? 400 : 500;
      return sendResponse(res, status, error.message || "ไม่ทราบสาเหตุ", null);
    }
  },
);

router.delete("/:id",authorize,checkRole(["admin"]), async function (req, res, next) {
  try {
    let { id } = req.params;
    let user = await userSchema.findByIdAndDelete(id);
    if (!user) {
      return sendResponse(res, 400, "ไม่พบผู้ใช้", null);
    }
    return sendResponse(res, 200, "สำเร็จ", user);
  } catch (error) {
    let status = isBadRequestError(error) ? 400 : 500;
    return sendResponse(res, status, error.message || "ไม่ทราบสาเหตุ", null);
  }
});
module.exports = router;
