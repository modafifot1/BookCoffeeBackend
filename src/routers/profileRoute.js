import { profileController } from "../controllers/profileController";
import { Router } from "express";
import { authMiddleware } from "../middlewares";
const baseUrl = "/api/v1/profile";
const { getProfileById, updateProfileById, updateAvatar } = profileController;
export const profileRoute = Router();

profileRoute.use(baseUrl, authMiddleware);

profileRoute.route(baseUrl).get(getProfileById);
profileRoute.route(baseUrl).put(updateProfileById);
profileRoute.route(`${baseUrl}/avatar`).put(updateAvatar);
