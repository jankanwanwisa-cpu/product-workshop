const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true
    },
    quantity: { type: Number, required: true },
    total_price: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  });

module.exports = mongoose.model("orders", orderSchema);
