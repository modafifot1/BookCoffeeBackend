import { Router } from "express";
import { customerController } from "../controllers";
import {
  // validatePermission,
  authMiddleware,
  // validateRequestBody,
} from "../middlewares";

const { getCustomerById, getListCustomer, updateCustomerStatus } =
  customerController;
const baseUrl = "/api/v1/customers";

export const customerRoute = Router();
customerRoute.use(`${baseUrl}`, authMiddleware);
//--------------------Managing users---------------------------//
customerRoute.route(`${baseUrl}`).get(getListCustomer);
customerRoute.route(`${baseUrl}/:customerId`).get(getCustomerById);
customerRoute.route(`${baseUrl}/:customerId`).put(updateCustomerStatus);
