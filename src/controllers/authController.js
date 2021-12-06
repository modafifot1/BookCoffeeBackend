import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { User, UserDetail } from "../models";
import { jwtToken } from "../utils";
import { envVariables } from "../configs";

const { encodeToken } = jwtToken;
const { tokenSecret, tokenLife, refreshTokenLife } = envVariables;
const LOG_TAG = "authController ";
/**
 * @api {post} /api/v1/auth/login login for all users
 * @apiName Login for all users
 * @apiGroup Auth
 * @apiParam {String} email email's user account
 * @apiParam {String} password password's user account
 * @apiSuccess {Int} status <code> 200</code>
 * @apiSuccess {String} msg <code>Login success</code> if everything went fine.
 * @apiSuccess {String} token <code>Token of user </code>
 * @apiSuccess {String} refreshToken <code> Refresh token of user </code>
 * @apiSuccess {Array[Int]} roleId <code> An array role of user </code>
 * @apiSuccess {ObjectId} userId
 * @apiSuccess {String} imageUrl
 * @apiSuccess {String} fullName
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Login is success",
 *         roleId: [1],
 *         token: "xxx.xxx.xxx",
 *         userId:"605a06776c02022ab46cc160",
 *         imageUrl:"211d2s12c3fsf3s2df",
 *         fullName: "Nguyen Quang Phieu"
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg":  userName or password is incorrect!"
 *     }
 */
const login = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "login begin!");
    let { email, password } = req.body;
    email = email.toLowerCase();
    console.log(LOG_TAG, "login: body data: " + email + ", " + password);
    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      throw createHttpError(400, "Email isn't exist!");
    }
    const matchPass = await bcrypt.compare(password, existedUser.password);
    if (!matchPass) {
      throw createHttpError(400, "Password is not correct!");
    }
    const tokenData = {
      _id: existedUser._id,
      email: existedUser.email,
      roleId: existedUser.roleId,
    };
    const token = await encodeToken(tokenData, tokenSecret, tokenLife);
    const refreshToken = await encodeToken(
      tokenData,
      tokenSecret,
      refreshTokenLife
    );
    const userDetail = await UserDetail.findOne({ userId: existedUser._id }, [
      "imageUrl",
      "fullName",
      "address",
    ]);
    res.status(200).json({
      status: 200,
      msg: "success!",
      roleId: existedUser.roleId,
      token,
      refreshToken,
      userId: existedUser._id,
      imageUrl: userDetail.imageUrl,
      fullName: userDetail.fullName,
      address: userDetail.address,
    });
    console.log(LOG_TAG, "login end!");
  } catch (error) {
    console.log("Error: ", error);
    next(error);
  }
};

export const authController = { login };