const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "merchant", "admin"],
      required: true,
      default: "user"
    },
    is_approved: { type: Boolean, default: false }
  },
  {
    timestamps: true
  });
  
module.exports = mongoose.model("users", userSchema);
