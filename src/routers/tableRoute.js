import { Router } from "express";
import { authMiddleware } from "../middlewares";
import { tableController } from "../controllers";
const { getListTable, subcribeTables } = tableController;
const baseUrl = "/api/v1/tables";
export const tableRoute = Router();
tableRoute.route(`${baseUrl}`).get(authMiddleware, getListTable);
tableRoute.route(`${baseUrl}`).post(authMiddleware, subcribeTables);
