import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { Token } from "../models";

const encodeToken = async (data, tokenSecret, tokenLife) => {
  const token = jwt.sign(data, tokenSecret, {
    expiresIn: tokenLife,
  });
  const token1 = await Token.create({
    userId: data._id,
    token,
  });
  console.log(token1);
  return token;
};
const verifyToken = async (token, tokenSecret) => {
  let data;
  try {
    data = jwt.verify(token, tokenSecret);
  } catch (error) {
    await Token.findOneAndDelete({ token });
    throw createHttpError(401, "Token bị hết hạn");
  }
  const existedToken = await Token.findOne({ token });
  if (!existedToken) {
    throw createHttpError(400, "Token không tồn tại!");
  }
  return data;
};
const destroyToken = async (userId) => {
  await Token.findOneAndDelete(userId);
};
export const jwtToken = {
  encodeToken,
  verifyToken,
  destroyToken,
};
