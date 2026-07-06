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

module.exports = router;