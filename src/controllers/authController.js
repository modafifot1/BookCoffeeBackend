import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { Book, User, UserDetail } from "../models";
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
/**
 * @api {post} /api/v1/auth/token Get new token
 * @apiName Get new token
 * @apiGroup Auth
 * @apiParam {String} refreshToken user's refresh token
 * @apiSuccess {Int} status <code> 200</code>
 * @apiSuccess {String} msg <code>Refresh token successfully!</code> if everything went fine.
 * @apiSuccess {String} token <code>Token of user </code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Refresh token successfully!",
 *         token: "xxx.xxx.xxx",
 *    }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 401,
 *       "msg":  RefreshToken expired!"
 *     }
 */
const getToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    console.log("Refresh token: ", refreshToken);
    if (!refreshToken) throw createHttpError(400, "No refresh token!");
    const data = await verifyToken(refreshToken, refreshTokenSecret);
    const { _id, email, roleId } = data;
    const userData = { _id, email, roleId };
    const token = await encodeToken(userData, tokenSecret, tokenLife);
    res.status(200).json({
      status: 200,
      msg: "Refresh token successfully!",
      token,
    });
  } catch (error) {
    console.log(error);
    if (error.status == 400) next(error);
    else {
      next(createHttpError(error.status, `Refresh ${error.message}`));
    }
  }
};
const registerNewCustomer = async (req, res, next) => {
  const { email, password, fullName, phoneNumber, birthday, address } =
    req.body;
  try {
    const userExisted = await User.findOne({ email });
    console.log("ExistedEmail: ", userExisted, fullName);
    if (userExisted) {
      throw createHttpError(400, "This email is used by others!");
      return;
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password: hashPassword,
      roleId: 1,
    });

    await UserDetail.create({
      userId: newUser._id,
      fullName,
      phoneNumber,
      birthday: new Date(birthday),
      address,
    });
    res.status(201).json({
      status: 201,
      msg: "Create a new customer successfully!",
      userId: newUser._id,
    });
    // const csv = require("csvtojson/v2");

    // const data = await csv().fromFile("books.csv");
    // await Promise.all(
    //   data.map((item) =>
    //     Book.create({
    //       bookId: item.book_id,
    //       title: item.original_title,
    //       author: item.authors,
    //       yearOfPublication: item.original_publication_year,
    //       rating: item.average_rating,
    //       imageUrl: item.image_url,
    //       numOfFeedback: item.ratings_count,
    //       quantity: 5,
    //     })
    //   )
    // );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const authController = { login, registerNewCustomer };
