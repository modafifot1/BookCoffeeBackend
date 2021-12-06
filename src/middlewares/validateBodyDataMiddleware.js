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

export const validateBodyData = {
  validateNewFoodData,
};
