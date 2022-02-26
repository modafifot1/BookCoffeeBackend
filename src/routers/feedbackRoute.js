import { Router } from "express";
import { feedbackController } from "../controllers";
import { authMiddleware } from "../middlewares";
const { addFeedback, reply, getAllFeedbacks } = feedbackController;
export const feedbackRoute = Router();
const baseUrl = "/api/v1/feedbacks";
feedbackRoute.use(`${baseUrl}`, authMiddleware);

feedbackRoute.route(`${baseUrl}`).post(addFeedback);
feedbackRoute.route(`${baseUrl}/reply`).post(reply);
feedbackRoute.route(`${baseUrl}/:foodId`).get(getAllFeedbacks);
