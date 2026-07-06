var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenMiddleware = require("../middleware/token.middleware");
const userSchema = require("../models/user.model");

/* GET users listing. */
router.get("/users", async function (req, res, next) {
  try {
    let users = await userSchema.find({});
    res.send({
      status: 200,
      message: "success",
      data: users,
    });
  } catch (error) {
    res.send({
      status: 400,
      message: error.message,
      data: [],
    });
  }
});

router.post("/register", async function (req, res, next) {
  try {
    let { username, password, role } = req.body;
    let user = new userSchema({
      username : username,
      password : await bcrypt.hash(password, 10),
      role: role || "user",
      is_approved: false,
    });
    await user.save();
    res.send({
      status: 201,
      message: "success",
      data: user,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
      data: [],
    });
  }
});

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    let user = await userSchema.findOne({ username });
    if (!user) {
      return res.send({
        status: 404,
        message: "User not found",
        data: [],
      });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send({
        status: 401,
        message: "Invalid password or username",
        data: [],
      });
    }

    let token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.send({
      status: 200,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
      data: [],
    });
  }
});

router.put(
  "/:id/approve",
  tokenMiddleware.authorize,
  tokenMiddleware.checkRole(["admin"]),
  async function (req, res, next) {
  try {
    let { id } = req.params;
    let { is_approved } = req.body;
    let user = await userSchema.findByIdAndUpdate(
      id,
      { is_approved: true },
      { new: true },
    );
    if (!user) {
      return res.send({
        status: 404,
        message: "User not found",
        data: [],
      });
    }
    res.send({
      status: 200,
      message: "User approved successfully",
      data: user,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
      data: [],
    });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let user = await userSchema.findByIdAndDelete(id);
    if (!user) {
      return res.send({
        status: 404,
        message: "User not found",
        data: [],
      });
    }
    res.send({
      status: 200,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
      data: [],
    });
  }
});
module.exports = router;
