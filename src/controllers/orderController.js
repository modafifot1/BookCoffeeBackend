import createHttpError from "http-errors";
import Mongoose from "mongoose";
import {
  distanceBetween2Points,
  getShipmentFee,
  getHash,
  getSignatue,
} from "../utils";
import { CartItem, Order, OrderItem, Table } from "../models";
import { envVariables, geocoder, MySocket } from "../configs";
const { my_address, public_key, secret_key, partner_code } = envVariables;
const axios = require("axios").default;
const { v1: uuidv1 } = require("uuid");
const LOG_TAG = "orderController";
/**
 * @api {get} /api/v1/orders Get list order by userId
 * @apiName Get list order
 * @apiGroup Order
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get list orders sucessfully</code> if everything went fine.
 * @apiSuccess {Array} cartItems <code> List the orders <code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *        {
 *           "status": 200,
 *           "msg": "Get list order sucessfully!",
 *           "orders": [
 *               {
 *                   "_id": "607ee38c5061c506d4604111",
 *                   "customerId": "607b99348f2d3500151f091d",
 *                   "address": "62/07 Đồng Kè, Liên Chiểu, Đà Năng",
 *                   "total": 278000,
 *                   "statusId": 0,
 *                   "createAt": "2021-04-20T14:22:04.994Z",
 *                   "__v": 0
 *               },
 *               {
 *                   "_id": "607f895a5e06da3054bacbc3",
 *                   "customerId": "607b99348f2d3500151f091d",
 *                   "address": "Hue",
 *                   "total": 128000,
 *                   "statusId": 0,
 *                   "createAt": "2021-04-21T02:09:30.509Z",
 *                   "__v": 0
 *               }
 *           ]
 *       }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const getListOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ customerId: userId });
    orders.map((x) => {
      return {
        _id: x._id,
        createAt: x.createAt,
        statusId: x.statusId,
        total: x.total,
      };
    });
    res.status(200).json({
      status: 200,
      msg: "Get list order sucessfully!",
      orders,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {get} /api/v1/orders/:orderId Get order by orderId
 * @apiName Get order by orderId
 * @apiGroup Order
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get list orders sucessfully</code> if everything went fine.
 * @apiSuccess {ObjectId} _id order's id
 * @apiSuccess {String} address customer's address
 * @apiSuccess {int} total order's total price
 * @apiSuccess {String} orderStatus order's status
 * @apiSuccess {Date} createAt purchase date
 * @apiSuccess {Array} orderItems List object of order items
 * @apiSuccess {Array} cartItems <code> List the orders <code>
 * @apiSuccessExample {json} Success-Example
 *          {
 *              "status": 200,
 *              "msg": "Get order successfully!",
 *              "_id": "607ee38c5061c506d4604111",
 *              "address": "62/07 Đồng Kè, Liên Chiểu, Đà Năng",
 *              "total": 278000,
 *              "orderStatus": "Chờ xác nhận",
 *              "createAt": "2021-04-20T14:22:04.994Z",
 *              "orderItems": [
 *                  {
 *                      "_id": "607ee38d5061c506d4604112",
 *                      "quantity": 4,
 *                      "foodId": "6076c317ebb733360805137a",
 *                      "name": "Orange juice",
 *                      "unitPrice": 40000,
 *                      "discountOff": 20
 *                  },
 *                  {
 *                      "_id": "607ee38d5061c506d4604113",
 *                      "quantity": 3,
 *                      "foodId": "607d81b6e141e742289e2ecf",
 *                      "name": "Gà sốt me",
 *                      "unitPrice": 50000
 *                  }
 *              ]
 *          }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const getOrderById = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getOrderById begin!");
    const orderId = req.params.orderId;
    console.log("orderId: ", orderId);
    const order = await Order.aggregate([
      {
        $lookup: {
          from: "OrderItem",
          localField: "_id",
          foreignField: "orderId",
          as: "items",
        },
      },
      {
        $match: {
          _id: Mongoose.Types.ObjectId(orderId),
        },
      },
    ]);
    console.log(await OrderItem.find({ orderId }));
    let orderItems = await OrderItem.aggregate([
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
          _id: {
            $in: order[0].items.map((x) => {
              return Mongoose.Types.ObjectId(x._id);
            }),
          },
        },
      },
    ]);
    orderItems = orderItems.map((x) => {
      return {
        _id: x._id,
        quantity: x.quantity,
        foodId: x.foodId,
        name: x.detail[0].name,
        unitPrice: x.detail[0].unitPrice,
        discountOff: x.detail[0].discountOff,
        discountMaximum: x.detail[0].discountMaximum,
        description: x.detail[0].description,
        imageUrl: x.detail[0].imageUrl,
      };
    });
    let status = await OrderStatus.findOne({ id: order[0].statusId });
    status = status.description;
    const data = {
      status: 200,
      msg: "Get order successfully!",
      _id: order[0]._id,
      address: order[0].address,
      total: order[0].total,
      orderStatus: status,
      createAt: order[0].createAt,
      orderItems,
    };
    res.status(200).json({
      status: 200,
      msg: "Get order successfully!",
      _id: order[0]._id,
      address: order[0].address,
      total: order[0].total,
      orderStatus: status,
      createAt: order[0].createAt,
      orderItems,
    });
    console.log(LOG_TAG, "getOrderById end!");
  } catch (error) {
    console.log(LOG_TAG, "getOrderById error: ", error);
    next(error);
  }
};
/**
 * @api {post} /api/v1/orders Create new order
 * @apiName Create new order
 * @apiGroup Order
 * @apiParam {String} address customer's address
 * @apiParam {Array} cartItems list id of cart items in order
 * @apiParam {String} paymentMethod The way user can pay for order
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Create new order successfully</code> if everything went fine.
 * @apiSuccess {Int} shipmentFee the shipment fee of order
 * @apiSuccess {Int} merchandiseSubtotal The total of merchandise
 * @apiSuccess {Int} paymentMethod The way user can pay for order
 * @apiSuccess {Float} distance The distance between two locations
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *        {
 *           "status": 200,
 *           "msg": "Create new order successfully!",
 *       }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const order = async (req, res, next) => {
  try {
    console.log("Body: ", req.body);
    let { cartItems, tableCode } = req.body;
    const table = await Table.find({ tableCode, status: 1 });
    console.log("table: ", !table);
    if (!tableCode || table.length) {
      throw createHttpError(404, "Please selected table!");
    }
    cartItems = cartItems.map((x) => {
      return Mongoose.Types.ObjectId(x);
    });
    let foods = await CartItem.aggregate([
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
          _id: {
            $in: cartItems,
          },
        },
      },
    ]);
    let total = foods.reduce((init, cur) => {
      return (
        init +
        calculatePrice(
          cur.detail[0].unitPrice,
          cur.quantity,
          cur.detail[0].discountOff,
          cur.detail[0].discountMaximum
        )
      );
    }, 0);
    res.status(200).json({
      status: 200,
      msg: "Order successfully!",
      total,
      tableCode,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {post} /api/v1/orders/purchase Purchase order
 * @apiName Purchase order
 * @apiGroup Order
 * @apiParam {String} address customer's address
 * @apiParam {Array} cartItems list id of cart items in order
 * @apiParam {String} paymentMethod The way user can pay for order
 * @apiParam {Int} shipmentFee The shiment fee of order
 * @apiParam {Int} merchandiseSubtotal the total of merchandise
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 201 </code>
 * @apiSuccess {String} msg <code>Create Purchase successfully</code> if everything went fine.
 * @apiSuccess {String} orderId id of new order
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 201 OK
 *        {
 *           "status": 201,
 *           "msg": "Purchase successfully!",
 *           "orderId": "id"
 *       }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const purchase = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    let {
      address,
      cartItems,
      paymentMethod,
      merchandiseSubtotal,
      shipmentFee,
      tableId,
    } = req.body;
    const table = await Table.findById(tableId);
    if (table.status == 1) {
      throw createHttpError(404, "Table is reservered!");
    } else {
      await Table.findByIdAndUpdate(tableId, { status: 1 });
    }
    cartItems = cartItems.map((x) => {
      return Mongoose.Types.ObjectId(x);
    });
    const newOrder = await Order.create({
      customerId,
      address,
      total: merchandiseSubtotal + shipmentFee,
      statusId: 0,
      paymentMethod,
      merchandiseSubtotal,
      shipmentFee,
    });
    let foods = await CartItem.aggregate([
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
          _id: {
            $in: cartItems,
          },
        },
      },
    ]);
    await CartItem.deleteMany({ _id: { $in: cartItems } });
    let orderItems = foods.map((x) => {
      return {
        foodId: x.foodId,
        quantity: x.quantity,
        orderId: newOrder._id,
      };
    });
    console.log("orderItem: ", orderItems);
    await OrderItem.insertMany(orderItems);

    const io = MySocket.prototype.getInstance();
    io.emit("NewOrder", "Create new order success!");
    res.status(201).json({
      status: 201,
      msg: "Purchase successfully!",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const calculatePrice = (unitPrice, quantity, discountOff, discountMaximum) => {
  if (discountOff) {
    let discount = (unitPrice * discountOff * quantity) / 100;
    if (discountMaximum && discount > discountMaximum) {
      return unitPrice * quantity - discountMaximum;
    }
    return quantity * unitPrice - discount;
  }
  return unitPrice * quantity;
};
/**
 * @api {delete} /api/v1/orders/:orderId Cancel order
 * @apiName Cancel order
 * @apiGroup Order
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Cancel order successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 201 OK
 *        {
 *           "status": 200,
 *           "msg": "Cancel order successfully!",
 *       }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *          "msg": "You can only cancel the order if don't over 5 minutes from ordering",
 *          "status": 400
 *       }
 */
const cancelOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    console.log(new Date(order.createAt));
    console.log(new Date(Date.now()));
    const duration = Date.now() - new Date(order.createAt).getTime();
    console.log("duration: ", duration);
    if (duration > 5 * 60 * 1000) {
      throw createHttpError(
        400,
        "You can only cancel the order if don't over 5 minutes from ordering"
      );
    }
    await Order.findByIdAndRemove(orderId);
    res.status(200).json({
      status: 200,
      msg: "Cancel order successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {put} /api/v1/orders/:orderId/statuses Update order Status
 * @apiName Update order status
 * @apiGroup Order
 * @apiParam  {String} code must be required when customer paid order.
 * @apiParam {String} shipperId must be required when shipOrerStatus(tranfer from status 1->2)
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK when confirm order
 *        {
 *           "status": 200,
 *           "msg": "Confirm successfully!",
 *       }
 *    HTTP/1.1 200 OK when ship order
 *        {
 *            "status": 200,
 *            "msg": "Tranfer to ship purchase successfully!"
 *        }
 *    HTTP/1.1 200 OK when paid order
 *        {
 *            "status": 200,
 *            "msg": "Pay for order successfully!"
 *        }
 *    HTTP/1.1 200 OK when Comfirm paid order
 *        {
 *            "status": 200,
 *            "msg": "Confirm paid order successfully!"
 *        }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *          "msg": "You can only cancel the order if don't over 5 minutes from ordering",
 *          "status": 400
 *       }
 */
const updateStatus = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "updateStatus begin!");

    const user = req.user;
    console.log("body: ", req.body);
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    console.log(LOG_TAG, "updateStatus - current status: ", order.statusId);
    const { statusId } = req.body;
    console.log(LOG_TAG, "updateStatus - update status: ", statusId);

    switch (order.statusId) {
      case 0:
        if (user.roleId != 2)
          throw createHttpError(400, "You are not employee");
        await confirmOrderStatus(order, res, next);
        break;
      case 1:
        if (user.roleId != 2)
          throw createHttpError(400, "You are not employee");
        if (order.statusId < statusId) {
          await prepareOrderStatus(order, res, next);
        }
        break;
      case 2:
        if (user.roleId != 2)
          throw createHttpError(400, "You are not employee!");
        await completeOrderStatus(order, res, next);
        break;
      default:
        break;
    }
    console.log(LOG_TAG, "updateOrder end!");
  } catch (error) {
    console.log(LOG_TAG, "updateOrder error: ", error);
    next(error);
  }
};
const confirmOrderStatus = async (order, res, next) => {
  try {
    await Order.findByIdAndUpdate(order._id, {
      statusId: 1,
    });
    res.status(200).json({
      status: 200,
      msg: "Confirm successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const prepareOrderStatus = async (order, res, next) => {
  try {
    await Order.findByIdAndUpdate(order._id, {
      statusId: 2,
    });
    res.status(200).json({
      status: 200,
      msg: "Prepare successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const completepaidOrderStatus = async (order, res, next) => {
  try {
    await Order.findByIdAndUpdate(order._id, {
      statusId: 2,
      isPaid: true,
    });
    const io = MySocket.prototype.getInstance();
    io.emit("UpdateOrderStatus", 3);
    res.status(200).json({
      status: 200,
      msg: "Pay for order successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @api {get} /api/v1/orders/statuses/:statusId Get list order by statusId
 * @apiName Get list order by statusId
 * @apiGroup Order
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get list orders by statusId sucessfully</code> if everything went fine.
 * @apiSuccess {Array} orders <code> List the orders <code>
 * @apiDuccess {Array} shippers <code> List shippers(if statusId != 1, list shipper is [])</code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *        {
 *           "status": 200,
 *           "msg": "Get list orders by statusId sucessfully!",
 *           "orders": [
 *               {
 *                   "_id": "6091ff398fe1960015a75a59",
 *                   "address": "472 Điện Biên Phủ, Thanh Khê Đông, Thanh Khê, Đà Nẵng",
 *                   "statusId": 0,
 *                   "paymentMethod": "COD",
 *                   "merchandiseSubtotal": 255000,
 *                   "shipmentFee": 10000,
 *                   "total": 265000,
 *                   "createAt": "2021-05-05T02:13:13.376Z",
 *                   "customerName": "Tiến Ngô Văn",
 *                   "phoneNumber": "0888071782",
 *                   "paymentCode": "n2zi2gTy" // return if statusId = 2
 *               },
 *               {
 *                   "_id": "609205998fe1960015a75a62",
 *                   "address": "472 Điện Biên Phủ, Thanh Khê Đông, Thanh Khê, Đà Nẵng",
 *                   "statusId": 0,
 *                   "paymentMethod": "COD",
 *                   "merchandiseSubtotal": 445000,
 *                   "shipmentFee": 10000,
 *                   "total": 455000,
 *                   "createAt": "2021-05-05T02:40:25.818Z",
 *                   "customerName": "Tiến Ngô Văn",
 *                   "phoneNumber": "0888071782",
 *                   "paymentCode": "n2zi2gTy" // return if statusId = 2
 *               },
 *               {
 *                   "_id": "60925fa26e204d001532c997",
 *                   "address": "472 Điện Biên Phủ, Thanh Khê Đông, Thanh Khê, Đà Nẵng",
 *                   "statusId": 0,
 *                   "paymentMethod": "COD",
 *                   "merchandiseSubtotal": 190000,
 *                   "shipmentFee": 10000,
 *                   "total": 200000,
 *                   "createAt": "2021-05-05T09:04:34.095Z",
 *                   "customerName": "Tiến Ngô Văn",
 *                   "phoneNumber": "0888071782",
 *                   "paymentCode": "n2zi2gTy" // return if statusId = 2
 *               },
 *               {
 *                   "_id": "60925fc46e204d001532c99b",
 *                   "address": "472 Điện Biên Phủ, Thanh Khê Đông, Thanh Khê, Đà Nẵng",
 *                   "statusId": 0,
 *                   "paymentMethod": "COD",
 *                   "merchandiseSubtotal": 120000,
 *                   "shipmentFee": 10000,
 *                   "total": 130000,
 *                   "createAt": "2021-05-05T09:05:08.835Z",
 *                   "customerName": "Tiến Ngô Văn",
 *                   "phoneNumber": "0888071782"
 *                   "paymentCode": "n2zi2gTy" // return if statusId = 2
 *               }
 *           ],
 *        shippers:[ // return if status Id =1
 *            {
 *              _id: "",
 *              fullName: "",
 *              phoneNumber: "",
 *            }
 *        ]
 *       }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const getListOrderByStatus = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getListOrderByStatus start!");
    const statusId = Number(req.params.statusId) || 0;
    console.log(LOG_TAG, "getListOrderByStatus - orderStatus: ", statusId);
    const user = req.user;
    let orders;
    if (user.roleId == 1) {
      orders = await Order.find({
        customerId: user._id,
        statusId,
      });
      orders = orders.map((x) => {
        return {
          _id: x._id,
          address: x.address,
          statusId: x.statusId,
          paymentMethod: x.paymentMethod,
          merchandiseSubtotal: x.merchandiseSubtotal,
          shipmentFee: x.shipmentFee,
          total: x.total,
          createAt: x.createAt,
          isPaid: x.isPaid,
        };
      });
    } else if (statusId == 1) {
      orders = await Order.aggregate([
        {
          $lookup: {
            from: "UserDetail",
            localField: "customerId",
            foreignField: "userId",
            as: "userDetail",
          },
        },
        {
          $match: {
            statusId: statusId,
          },
        },
      ]);
      const orderIds = orders.map((x) => {
        return x._id;
      });
      if (statusId == 2) {
        orders = orders.map((x) => {
          const index = orderIds.indexOf(x._id);
          return {
            _id: x._id,
            address: x.address,
            statusId: x.statusId,
            paymentMethod: x.paymentMethod,
            merchandiseSubtotal: x.merchandiseSubtotal,
            shipmentFee: x.shipmentFee,
            total: x.total,
            createAt: x.createAt,
            isPaid: x.isPaid,
            customerName:
              x.userDetail[0] != undefined
                ? x.userDetail[0].fullName
                : undefined,
            phoneNumber:
              x.userDetail[0] != undefined
                ? x.userDetail[0].phoneNumber
                : undefined,
          };
        });
      }
    }
    res.status(200).json({
      status: 200,
      msg: "Get list order by status sucessfully!",
      orders,
      shippers,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const momoPayment = async (req, res, next) => {
  try {
    console.log("Body: ", req.body);
    let {
      partnerCode,
      partnerRefId,
      amount,
      customerNumber,
      appData,
      version,
      payType,
      orderId,
    } = req.body;
    version = parseFloat(version);
    payType = parseInt(payType);
    amount = parseInt(amount);
    const hashData = { partnerCode, partnerRefId, amount };
    console.log(typeof hashData);
    const hash = getHash(public_key, hashData);
    console.log(hash);
    const bodyData = {
      partnerCode: partner_code,
      partnerRefId,
      customerNumber,
      appData,
      hash,
      version,
      payType,
    };
    console.log("Data: ", bodyData);
    var { data } = await axios.post(
      "https://test-payment.momo.vn/pay/app",
      bodyData
    );
    console.log(data);
    if (data.status != 0) throw createHttpError(400, data.message);
    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
    });
    console.log("Orders: ", await Order.findById(orderId));
    res.status(200).json({
      status: 200,
      msg: "Successful transaction!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const momoPaymentConfirm = async (req, res, next) => {
  try {
    const { partnerCode, status, message, partnerRefId, momoTransId, amount } =
      req.body;
    let signatureData = {
      amount,
      message,
      momoTransId,
      partnerRefId,
      status,
    };
    let signature = getSignatue(secret_key, signatureData);
    console.log(signature);
    res.status(200).json({
      status,
      message,
      partnerRefId,
      momoTransId,
      amount,
      signature,
    });

    signatureData = {
      partnerCode: partner_code,
      partnerRefId,
      requestType: "capture",
      requestId: uuidv1(),
      momoTransId,
    };
    signature = getSignatue(secret_key, signatureData);
    const { data } = await axios.post(
      "https://test-payment.momo.vn/pay/confirm",
      {
        ...signatureData,
        signature,
      }
    );
    console.log(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const orderController = {
  getListOrder,
  getOrderById,
  order,
  purchase,
  cancelOrderById,
  updateStatus,
  getListOrderByStatus,
  momoPayment,
  momoPaymentConfirm,
};
