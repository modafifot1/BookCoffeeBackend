import { borrowedBookController } from "../controllers";
import { Router } from "express";
import { authMiddleware } from "../middlewares";

const {
  getListBorrowedBookByStatus,
  getBorrowedBookById,
  createBorrowedBook,
  updateBorrowedBookById,
} = borrowedBookController;
const baseUrl = "/api/v1/books";
export const borrowedBookRoute = Router();
borrowedBookRoute.use(baseUrl, authMiddleware);
borrowedBookRoute
  .route(`${baseUrl}/statuses/:status`)
  .get(getListBorrowedBookByStatus);
borrowedBookRoute.route(`${baseUrl}/:borrowedBookId`).get(getBorrowedBookById);
borrowedBookRoute.route(baseUrl).post(createBorrowedBook);
borrowedBookRoute
  .route(`${baseUrl}/:borrowedBookId`)
  .put(updateBorrowedBookById);
