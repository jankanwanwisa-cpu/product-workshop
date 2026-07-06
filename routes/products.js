var express = require("express");
var router = express.Router();
const productSchema = require("../models/product.model");
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

router.get(
  "/:id",
  async function (req, res, next) {
    try {
      let { id } = req.params;
      let product = await productSchema.findById(id);
      if (!product) {
        return sendResponse(res, 404, "Product not found", null);
      }
      return sendResponse(res, 200, "success", product);
    } catch (error) {
      return sendResponse(res, 500, error.message || "error", null);
    }
  },
);
module.exports = router;
