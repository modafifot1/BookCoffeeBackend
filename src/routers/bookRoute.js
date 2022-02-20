import { bookController } from "../controllers";
import { authMiddleware } from "../middlewares";
import { Router } from "express";
const { getListBook, getBookById, createBook, updateBookById, deleteBook } =
  bookController;
const baseUrl = "/api/v1/books";
export const bookRoute = Router();
bookRoute.use(baseUrl, authMiddleware);
bookRoute.route(`${baseUrl}/?`).get(getListBook);
bookRoute.route(`${baseUrl}/:bookId`).get(getBookById);
bookRoute.route(baseUrl).post(createBook);
bookRoute.route(`${baseUrl}/:bookId`).put(updateBookById);
bookRoute.route(`${baseUrl}/:bookId`).delete(deleteBook);