import { bookController } from "../controllers";
import { authMiddleware, isAdminAndEmployee } from "../middlewares";
import { Router } from "express";
const {
  getListBook,
  getBookById,
  createBook,
  updateBookById,
  deleteBook,
  getBookForYou,
} = bookController;
const baseUrl = "/api/v1/books";
export const bookRoute = Router();
bookRoute.use(baseUrl, authMiddleware);
bookRoute.route(`${baseUrl}/?`).get(getListBook);
bookRoute.route(`${baseUrl}/:bookId`).get(getBookById);
bookRoute.route(baseUrl).post(isAdminAndEmployee, createBook);
bookRoute.route(`${baseUrl}/:bookId`).put(isAdminAndEmployee, updateBookById);
bookRoute.route(`${baseUrl}/:bookId`).delete(isAdminAndEmployee, deleteBook);
bookRoute.route(`${baseUrl}/related-book/for-you`).get(getBookForYou);
