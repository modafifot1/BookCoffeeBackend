import { Router } from "express";
import { authController } from "../controllers";
import { authMiddleware } from "../middlewares";
const { login, registerNewCustomer, changePassword, logout } = authController;
const baseUrl = "/api/v1/auth";

export const authRoute = Router();
authRoute.route(`${baseUrl}/login`).post(login);
authRoute.route(`${baseUrl}/register`).post(registerNewCustomer);
authRoute
  .route(`${baseUrl}/changePassword`)
  .put(authMiddleware, changePassword);
authRoute.route(`${baseUrl}/logout`).post(authMiddleware, logout);
