import { validateRequest } from "../utils";
import joi from "joi";
const LOG_TAG = "ValidateBodyDataMiddleware";

const validateNewFoodData = async (req, res, next) => {
  console.log(LOG_TAG, "validateNewFoodData begin!");
  try {
    console.log("Body data: ", req);
    const foodSchema = joi.object({
      name: joi.string().max(256).min(1).required(),
      unitPrice: joi.number().integer().min(1000).required(),
      discountOff: joi.number().min(0).max(100),
      description: joi.string().max(1024),
      discountMaximum: joi.number().min(0).max(joi.ref("unitPrice")),
    });
    validateRequest(req, foodSchema, next);
    console.log(LOG_TAG, "validateNewFoodData end!");
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const validateCreateOrder = async (req, res, next) => {
  try {
    if (typeof req.body.cartItems != "object") {
      req.body.cartItems = [req.body.cartItems];
    }
    const orderSchema = joi.object({
      cartItems: joi.array().min(1).required(),
      tableCode: joi.number().required(),
    });
    validateRequest(req, orderSchema, next);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const validateCreatePurchase = async (req, res, next) => {
  try {
    if (typeof req.body.cartItems != "object") {
      req.body.cartItems = [req.body.cartItems];
    }
    const orderSchema = joi.object({
      address: joi.string().required(),
      cartItems: joi.array().min(1).required(),
      paymentMethod: joi.string().required(),
      merchandiseSubtotal: joi.number().required().min(0),
      shipmentFee: joi.number().required().min(0),
      tableId: joi.string().required(),
    });
    validateRequest(req, orderSchema, next);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const validateBodyData = {
  validateNewFoodData,
  validateCreateOrder,
  validateCreatePurchase,
};
