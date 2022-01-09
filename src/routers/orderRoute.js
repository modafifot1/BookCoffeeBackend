import { Router } from "express";
import { authMiddleware, validateBodyData } from "../middlewares";
import { orderController } from "../controllers";
const {
  getListOrder,
  getOrderById,
  order,
  purchase,
  cancelOrderById,
  updateStatus,
  getListOrderByStatus,
  momoPayment,
  momoPaymentConfirm,
} = orderController;
const { validateCreateOrder, validateCreatePurchase } = validateBodyData;
const baseUrl = "/api/v1/orders";
export const orderRoute = Router();
orderRoute.route(`${baseUrl}`).post(authMiddleware, validateCreateOrder, order);
orderRoute
  .route(`${baseUrl}/purchase`)
  .post(authMiddleware, validateCreatePurchase, purchase);
orderRoute.route(`${baseUrl}/payment`).post(authMiddleware, momoPayment);
orderRoute.route(`${baseUrl}/payment-confirm`).post(momoPaymentConfirm);
orderRoute.route(`${baseUrl}`).get(authMiddleware, getListOrder);
orderRoute.route(`${baseUrl}/:orderId`).get(authMiddleware, getOrderById);
orderRoute.route(`${baseUrl}/:orderId`).delete(authMiddleware, cancelOrderById);
orderRoute
  .route(`${baseUrl}/:orderId/statuses`)
  .put(authMiddleware, updateStatus);
orderRoute
  .route(`${baseUrl}/statuses/:statusId`)
  .get(authMiddleware, getListOrderByStatus);
