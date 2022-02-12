import { Router } from "express";
import { authController } from "../controllers";

const { login, registerNewCustomer } = authController;
const baseUrl = "/api/v1/auth";

export const authRoute = Router();
authRoute.route(`${baseUrl}/login`).post(login);
authRoute.route(`${baseUrl}/register`).post(registerNewCustomer);
