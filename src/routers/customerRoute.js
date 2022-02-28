import { Router } from "express";
import { customerController } from "../controllers";
import {
  // validatePermission,
  authMiddleware,
  // validateRequestBody,
  isAdminRole
} from "../middlewares";

const { getCustomerById, getListCustomer, updateCustomerStatus } =
  customerController;
const baseUrl = "/api/v1/customers";

export const customerRoute = Router();
customerRoute.use(`${baseUrl}`, authMiddleware);
//--------------------Managing users---------------------------//
customerRoute.route(`${baseUrl}`).get(isAdminRole, getListCustomer);
customerRoute.route(`${baseUrl}/:customerId`).get(isAdminRole, getCustomerById);
customerRoute.route(`${baseUrl}/:customerId`).put(isAdminRole, updateCustomerStatus);
