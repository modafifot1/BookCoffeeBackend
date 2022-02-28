import { Router } from "express";
import { authMiddleware, isAdminRole } from "../middlewares";
import { statisticController } from "../controllers";
const baseUrl = "/api/v1/statistic";
const { getRevenuesInfo, getGeneralInfo } = statisticController;
export const statisticRoute = Router();

statisticRoute.use(baseUrl, authMiddleware, isAdminRole);
statisticRoute.route(`${baseUrl}/revenueInfo/:getInfoBy`).get(getRevenuesInfo);
statisticRoute.route(`${baseUrl}/generalInfo`).get(getGeneralInfo);
