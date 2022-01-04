import { Router } from "express";
import { authMiddleware } from "../middlewares";
import { cartController } from "../controllers";
const {
  getListCartItem,
  createNewCartItem,
  updateCartItem,
  deleteCartItem,
  deleteAllCartItem,
} = cartController;
const baseUrl = "/api/v1/carts";
export const cartRoute = Router();
cartRoute.use(`${baseUrl}`, authMiddleware);
cartRoute.route(`${baseUrl}`).get(getListCartItem);
cartRoute.route(`${baseUrl}`).post(createNewCartItem);
cartRoute.route(`${baseUrl}/:cartId`).put(updateCartItem);
cartRoute.route(`${baseUrl}`).delete(deleteCartItem);

// cartRoute
//   .route(`${baseUrl}`)
//   .delete(checkPermission("CART_ITEM", "Delete"), deleteAllCartItem);
// cartRoute
//   .route(`${baseUrl}/:itemId`)
//   .get(checkPermission("CART_ITEM", "View"), getCartItemById);
