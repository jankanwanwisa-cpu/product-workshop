const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    merchant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  });

module.exports = mongoose.model("products", productSchema);
