import { Router } from "express";
import { borrowedBookRoute } from "./borrowedBookRoute";
import { authMiddleware } from "../middlewares";
import { borrowedBookCartController } from "../controllers";

const {
  getBorrowBookCart,
  updateBorrowedBookCartItemById,
  deleteBorrowedBookCartItemById,
  addBookToCart,
} = borrowedBookCartController;
const baseUrl = "/api/v1/bookCarts";
export const borowedBookCartRoute = Router();
borrowedBookRoute.use(baseUrl, authMiddleware);
borrowedBookRoute.route(baseUrl).get(getBorrowBookCart);
borrowedBookRoute.route(`${baseUrl}`).post(addBookToCart);
borrowedBookRoute
  .route(`${baseUrl}/:borowedBookCartItemId`)
  .put(updateBorrowedBookCartItemById);
borrowedBookRoute.route(`${baseUrl}`).delete(deleteBorrowedBookCartItemById);
