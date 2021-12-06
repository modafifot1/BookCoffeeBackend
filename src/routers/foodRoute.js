import { Router } from "express";
import { foodController } from "../controllers";
import { authMiddleware } from "../middlewares";
import { validateBodyData } from "../middlewares";

const { validateNewFoodData } = validateBodyData;
const {
  getListFoodPerPage,
  createNewFood,
  getFoodById,
  updateFoodById,
  deleteFoodById,
  confirmFood,
} = foodController;
const baseUrl = "/api/v1/foods";

export const foodRoute = Router();
foodRoute.use(`${baseUrl}`, authMiddleware);
foodRoute.route(`${baseUrl}?`).get(getListFoodPerPage);
foodRoute.route(`${baseUrl}`).post(validateNewFoodData, createNewFood);
foodRoute.route(`${baseUrl}/:foodId`).get(getFoodById);
foodRoute.route(`${baseUrl}/:foodId`).put(updateFoodById);
foodRoute.route(`${baseUrl}/:foodId`).delete(deleteFoodById);
foodRoute.route(`${baseUrl}/:foodId`).post(confirmFood);
