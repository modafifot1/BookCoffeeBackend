import { jwtToken } from "../utils";
import createHttpError from "http-errors";
import { envVariables } from "../configs";

const { tokenSecret } = envVariables;
const { encodeToken, verifyToken } = jwtToken;
const LOG_TAG = "authMiddleware ";
export const authMiddleware = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "authorization: " + req.headers.authorization);
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      throw createHttpError(403, "no token, authorization is denied!");
    }
    try {
      const token = req.headers.authorization.split(" ")[1];
      const userData = await verifyToken(token, tokenSecret);
      req.user = userData;
      next();
    } catch (error) {
      console.log(LOG_TAG, "authorization failed " + error);
      throw createHttpError(error.status, error.message);
    }
  } catch (error) {
    console.log("Error: ", error);
    next(error);
  }
};
export const isAdminRole = async (req, res, next) => {
  try {
    if (req.user._id !== 0)
      throw createHttpError(400, "Bạn không phải là admin");
    next();
  } catch (error) {
    next(error);
  }
};
export const isEmployeeRole = async (req, res, next) => {
  try {
    if (req.user._id !== 2)
      throw createHttpError(400, "Bạn không phải là nhân viên");
    next();
  } catch (error) {
    next(error);
  }
};

export const isAdminAndEmployee = async (req, res, next) => {
  try {
    if (req.user._id !== 2 && req.user._id !== 0)
      throw createHttpError(400, "Bạn không phải là nhân viên hay admin");
    next();
  } catch (error) {
    next(error);
  }
};
