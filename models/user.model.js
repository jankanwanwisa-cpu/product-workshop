const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    is_approved: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("user", userSchema);
