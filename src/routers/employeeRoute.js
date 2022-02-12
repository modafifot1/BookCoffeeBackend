import { Router } from "express";
import { employeeController } from "../controllers";
import {
  // validatePermission,
  authMiddleware,
  // validateRequestBody,
} from "../middlewares";
const baseUrl = "/api/v1/employees";
const {
  createNewEmployee,
  getListEmployees,
  getEmpployeeById,
  updateEmployeeById,
  deleteEmployeeById,
} = employeeController;
// const { validateEmployeeData, validateUpdateEmployeeData } =
//   validateRequestBody;
// const { isAdminRole } = validatePermission;

export const employeeRoute = Router();
employeeRoute.use(`${baseUrl}`, authMiddleware);
// employeeRoute.use(`${baseUrl}`, isAdminRole);
//--------------------Managing employees---------------------------//
employeeRoute.route(`${baseUrl}`).get(getListEmployees);
employeeRoute.route(`${baseUrl}/:employeeId`).get(getEmpployeeById);
employeeRoute.route(`${baseUrl}`).post(createNewEmployee);
employeeRoute.route(`${baseUrl}/:employeeId`).put(updateEmployeeById);
employeeRoute.route(`${baseUrl}`).delete(deleteEmployeeById);
