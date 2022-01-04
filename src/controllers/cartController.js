import createHttpError from "http-errors";
import Mongoose from "mongoose";
import { CartItem, Food } from "../models";
const LOG_TAG = "cartController";
/**
 * @api {get} /api/v1/carts Get cart item
 * @apiName Get cart item
 * @apiGroup Cart
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>get list cart item successfully</code> if everything went fine.
 * @apiSuccess {Array} cartItems <code> List cart item page <code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "get list cart item successfully!",
 *         "cartItems": [
 *            {
 *            "_id": "607d3e2a8ce6ab317096a869",
 *            "foodId": "6076c317ebb733360805137a",
 *            "quantity": 4,
 *            "name": "Orange juice",
 *            "unitPrice": 40000,
 *            "imageUrl": "https://res.cloudinary.com/dacnpm17n2/image/upload/v1618395927/syp4cyw7tjzxddyr8xxd.png"
 *            }
 *          ]
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const getListCartItem = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getListCartItem begin!");
    const userId = req.user._id;
    // const cartItems = await CartItem.find({ customerId: userId });
    let cartItems = await CartItem.aggregate([
      {
        $lookup: {
          from: "Food",
          localField: "foodId",
          foreignField: "_id",
          as: "detail",
        },
      },
      {
        $match: {
          customerId: Mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    console.log(cartItems[0]);
    let totalItems = 0;
    cartItems = cartItems.map((x) => {
      totalItems += x.quantity;
      return {
        _id: x._id,
        foodId: x.foodId,
        quantity: x.quantity,
        name: x.detail[0].name,
        unitPrice: x.detail[0].unitPrice,
        imageUrl: x.detail[0].imageUrl,
        discountOff: x.detail[0].discountOff,
      };
    });
    res.status(200).json({
      status: 200,
      msg: "Get cart item successfully!",
      cartItems,
      numOfAddedItems: totalItems,
    });
    console.log(LOG_TAG, "getListCartItem end!");
  } catch (error) {
    console.log(LOG_TAG, "getListCartItem error: ", error);
    next(error);
  }
};
/**
 * @api {post} /api/v1/carts Add cart item
 * @apiName Add cart item
 * @apiGroup Cart
 * @apiParam {ObjectId} foodId food's Id required when add one item
 * @apiParam {int} quantity quantity food required when add one Item
 * @apiParam {Object} cartItems key-_itemId, value-quantity
 * @apiParamExample {json} Param example
 * {
 *      cartItems:
 *        {
 *          "607faeb5d35ea403f0328a38": 3,
 *        }
 *
 * }
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Add cart item successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Add cart item successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const createNewCartItem = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "createNewCartItem begin!");
    const userId = req.user._id;
    let { foodId, quantity, cartItems } = req.body;
    console.log("body data: ", req.body);
    let total = 0;
    if (!cartItems) {
      total = quantity;
      await addOneCartItem(userId, foodId, quantity);
    } else {
      console.log(cartItems);
      const keys = Object.keys(cartItems);
      for (const key of keys) {
        total += cartItems[key];
        await addOneCartItem(userId, key, cartItems[key]);
      }
    }
    res.status(201).json({
      status: 201,
      msg: "Add cart item successfully!",
      numOfAddedItems: total,
    });
    console.log(LOG_TAG, "createNewCartItem end!");
  } catch (error) {
    console.log(LOG_TAG, "createNewCartItem error: ", error);
    next(error);
  }
};
const addOneCartItem = async (userId, foodId, quantity) => {
  try {
    console.log(LOG_TAG, "addOneCartItem begin!");
    const existedCartItem = await CartItem.findOne({
      customerId: userId,
      foodId,
    });
    quantity = Number(quantity);
    if (existedCartItem) {
      await CartItem.findByIdAndUpdate(existedCartItem._id, {
        quantity: existedCartItem.quantity + quantity,
      });
    } else {
      await CartItem.create({
        customerId: userId,
        foodId,
        quantity,
      });
    }
    console.log(LOG_TAG, "addOneCartItem end!");
  } catch (error) {
    console.log(LOG_TAG, "addOneCartItem error", error);
    throw createHttpError(400, error);
  }
};
/**
 * @api {put} /api/v1/carts/:cartId Update cart item
 * @apiName Update cart item
 * @apiGroup Cart
 * @apiParam {Number} quantity
 * @apiParamExample {json} Param example
 * {
 *      quantity: 3
 * }
 *
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Update cart item successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Update cart item successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const updateCartItem = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "updateCartItem begin!");
    const { cartId } = req.params;
    const { quantity } = req.body;
    console.log(LOG_TAG, "cartId: ", cartId, ", quantity: ", quantity);
    const result = await CartItem.findByIdAndUpdate(cartId, { quantity });
    if (!result) {
      throw createHttpError(404, "Not found cart item");
    }
    res.status(200).json({
      status: 200,
      msg: "Update cart item successfully!",
    });
    console.log(LOG_TAG, "updateCartItem end!");
  } catch (error) {
    console.log(LOG_TAG, "updateCartItem error: ", error);
    next(error);
  }
};
/**
 * @api {delete} /api/v1/carts Delete cart item
 * @apiName Delete cart item
 * @apiGroup Cart
 * @apiParam {array} cartItems list id of cart item id
 * @apiParamExample {json} param example
 * {
 *    "cartItems" :[
 *        "607faeb5d35ea403f0328a38"
 *    ]
 * }
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Delete cart item successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Delete cart item successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const deleteCartItem = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "deleteCartItem begin!");
    const { cartItems } = req.body;
    console.log(LOG_TAG, "cartItems: ", cartItems);
    const cartItem = await CartItem.deleteMany({
      _id: {
        $in: cartItems,
      },
    });
    if (!cartItem) {
      throw createHttpError(404, "Not found item");
    }
    res.status(200).json({
      status: 200,
      msg: "Delete cart item successfully",
      cartItems,
    });
    console.log(LOG_TAG, "deleteCartItem end!");
  } catch (error) {
    console.log(LOG_TAG, "deleteCartItem error: ", error);
    next(error);
  }
};
const deleteAllCartItem = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "deleteAllCartItem begin!");
    const userId = req.user._id;
    await CartItem.remove({ customerId: userId });
    res.status(200).json({
      status: 200,
      msg: "Delete all cart items successfully!",
    });
    console.log(LOG_TAG, "deleteAllCartItem end!");
  } catch (error) {
    console.log(LOG_TAG, "deleteAllCartItem error: ", error);
    next(error);
  }
};
export const cartController = {
  getListCartItem,
  createNewCartItem,
  deleteCartItem,
  updateCartItem,
  deleteAllCartItem,
};
