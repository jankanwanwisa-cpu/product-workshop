var express = require("express");
var router = express.Router();

const orderSchema = require("../models/order.model");
const productSchema = require("../models/product.model");
const { sendResponse } = require("../utils/response");
const { authorize } = require("../middleware/token.middleware");

router.get("/", authorize, async function (req, res, next) {
  try {
    let orders = await orderSchema.find({ isDeleted: false });
    return sendResponse(res, 200, "สำเร็จ", orders);
  } catch (error) {
    return sendResponse(res, 500, error.message || "ไม่ทราบสาเหตุ", null);
  }
});
router.delete("/:id", authorize, async function (req, res, next) {
  try {
    let { id } = req.params;
    let order = await orderSchema.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!order) {
      return sendResponse(res, 400, "ไม่พบคำสั่งซื้อ", null);
    }
    return sendResponse(res, 200, "สำเร็จ", order);
  } catch (error) {
    return sendResponse(res, 500, error.message || "ไม่ทราบสาเหตุ", null);
  }
});

module.exports = router;