var express = require("express");
var router = express.Router();
const productSchema = require("../models/product.model");
const orderSchema = require("../models/order.model");
const { sendResponse } = require("../utils/response");
const { authorize, checkRole } = require("../middleware/token.middleware");

router.get("/", async function (req, res, next) {
  try {
    let products = await productSchema.find({ isDeleted: false });
    return sendResponse(res, 200, "success", products);
  } catch (error) {
    return sendResponse(res, 500, error.message || "error", []);
  }
});

router.post(
  "/",
  authorize,
  checkRole(["merchant"]),
  async function (req, res, next) {
    try {
      let { name, price, stock } = req.body;
      if (!name || !price) {
        return sendResponse(res, 400, "name and price are required", null);
      }
      let product = new productSchema({
        name,
        price,
        stock,
        merchant_id: req.user.id,
      });
      await product.save();
      return sendResponse(res, 201, "success", product);
    } catch (error) {
      return sendResponse(res, 500, error.message || "error", null);
    }
  },
);

router.put(
  "/:id",
  authorize,
  checkRole(["merchant"]),
  async function (req, res, next) {
    try {
      let { id } = req.params;
      let { name, price, stock } = req.body;
      let product = await productSchema
        .findByIdAndUpdate(id, { name, price, stock }, { new: true })
        .populate("merchant_id", "username");
      if (!product) {
        return sendResponse(res, 400, "Product not found", null);
      }
      return sendResponse(res, 200, "success", product);
    } catch (error) {
      return sendResponse(res, 500, error.message || "error", null);
    }
  },
);

router.delete(
  "/:id",
  authorize,
  checkRole(["merchant"]),
  async function (req, res, next) {
    try {
      let { id } = req.params;
      let product = await productSchema.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );
      if (!product) {
        return sendResponse(res, 400, "Product not found", null);
      }
      return sendResponse(res, 200, "success", product);
    } catch (error) {
      return sendResponse(res, 500, error.message || "error", null);
    }
  },
);

router.get("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let product = await productSchema.findById(id);
    if (!product) {
      return sendResponse(res, 400, "Product not found", null);
    }
    return sendResponse(res, 200, "success", product);
  } catch (error) {
    return sendResponse(res, 500, error.message || "error", null);
  }
});

router.get("/:id/orders", authorize, async function (req, res, next) {
  try {
    let { id } = req.params;
    let orders = await orderSchema
      .find({ product_id: id, isDeleted: false })
      .populate("user_id", "username");
    return sendResponse(res, 200, "success", orders);
  } catch (error) {
    return sendResponse(res, 500, error.message || "error", []);
  }
});

router.post("/:id/orders", authorize, async function (req, res, next) {
  try {
    let { id } = req.params;
    let { quantity } = req.body;
    let orderQuantity = Number(quantity);
    if (!Number.isFinite(orderQuantity) || orderQuantity <= 0) {
      return sendResponse(res, 400, "quantity is required", null);
    }

    let product = await productSchema.findByIdAndUpdate(
      { _id: id, isDeleted: false, stock: { $gte: orderQuantity } },
      { $inc: { stock: -orderQuantity } },
      { new: true },
    );

    if (!product) {
      let productExists = await productSchema.findById({ _id: id, isDeleted: false });
      if (!productExists) {
        return sendResponse(res, 400, "Product not found", null);
      }
      return sendResponse(res, 400, "quantity exceeds product stock", null);
    }

    let order = new orderSchema({
      product_id: id,
      user_id: req.user.id,
      quantity: orderQuantity,
      total_price: product.price * orderQuantity,
    });
    await order.save();
    return sendResponse(res, 201, "success", order);
  } catch (error) {
    return sendResponse(res, 500, error.message || "error", null);
  }
});

module.exports = router;
