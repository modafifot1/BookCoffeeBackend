import Mongoose from "mongoose";
import { User } from "../models";

const LOG_TAG = "customerController: ";

/**
 * @api {get} /api/v1/customers Get list customers
 * @apiName Get list customers
 * @apiGroup Admin
 * @apiHeader {String} Authorization The token can be generated from your customer profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get list customer successfully!</code> if everything went fine.
 * @apiSuccess {Array} customers <code> List of eployees</code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Get list customer successfully!",
 *         customers: [
 *          {
 *          "_id": "6076c201228fe14534c3ca4a",
 *           "email": "customers1@gmail.com",
 *           "roleId": 2,
 *           "fullName": "Nguyen Van B",
 *           "phoneNumber": "03566382356",
 *           "birthday": "1999-04-27T17:00:00.000Z"
 *          }
 *        ]
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Not found"
 *     }
 */
const getListCustomer = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getListcustomer Begin!");
    const { searchText, customerType } = req.query;
    console.log(req.query);
    let filter = { roleId: 1 };
    if (searchText) {
      filter = {
        ...filter,
        email: {
          $regex: searchText,
        },
      };
    }
    if (customerType && customerType != 0) {
      filter = {
        ...filter,
        isBlocked: customerType == -1 ? false : true,
      };
    }
    console.log("Filter: ", filter);
    let listcustomers = await User.aggregate([
      {
        $lookup: {
          from: "UserDetail",
          localField: "_id",
          foreignField: "userId",
          as: "userDetail",
        },
      },
      {
        $match: filter,
      },
    ]);
    listcustomers = listcustomers.map((x) => {
      return {
        _id: x._id,
        email: x.email,
        roleId: x.roleId,
        fullName: x.userDetail[0].fullName,
        phoneNumber: x.userDetail[0].phoneNumber,
        birthday: x.userDetail[0].birthday,
        address: x.userDetail[0].address,
        isConfirmed: x.isConfirmed,
        imageUrl: x.userDetail[0].imageUrl,
        isBlocked: x.isBlocked,
      };
    });
    console.log(listcustomers);
    res.status(200).json({
      status: 200,
      msg: "Lấy danh sách người dùng thành công!",
      customers: listcustomers,
    });
    console.log(LOG_TAG, "getListcustomer end!");
  } catch (error) {
    console.log(LOG_TAG, "getListcustomer", error);
    next(error);
  }
};

/**
 * @api {get} /api/v1/customers/:customerId Get customer by id
 * @apiName Get customer by id
 * @apiGroup Admin
 * @apiHeader {String} Authorization The token can be generated from your customer profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get customer by id successfully!</code> if everything went fine.
 * @apiSuccess {Object} customer <code>customer</code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Get list customer successfully!",
 *         customer:
 *          {
 *          "_id": "6076c201228fe14534c3ca4a",
 *           "email": "customers1@gmail.com",
 *           "roleId": 2,
 *           "fullName": "Nguyen Van B",
 *           "phoneNumber": "03566382356",
 *           "birthday": "1999-04-27T17:00:00.000Z",
 *            "isBlocked": true
 *          }
 *
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Not found"
 *     }
 */
const getCustomerById = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getcustomerById Begin!");
    const customerId = req.params.customerId;
    const customer = await User.aggregate([
      {
        $lookup: {
          from: "UserDetail",
          localField: "_id",
          foreignField: "userId",
          as: "userDetail",
        },
      },
      {
        $match: {
          _id: Mongoose.Types.ObjectId(customerId),
        },
      },
    ]);
    if (!customer) {
      throw createHttpError(400, "Khách hàng không tồn tại!");
    }
    res.status(200).json({
      status: 200,
      msg: "Lấy chi tiết thông tin khách hàng thành công!",
      customer: {
        _id: customer[0]._id,
        email: customer[0].email,
        role: customer[0].role,
        createAt: customer[0].createAt,
        phoneNumber: customer[0].userDetail[0].phoneNumber,
        fullName: customer[0].userDetail[0].fullName,
        birthday: customer[0].userDetail[0].birthday,
        isBlocked: customer[0].isBlocked,
      },
    });
    console.log(LOG_TAG, "getcustomerById End!");
  } catch (error) {
    console.log(LOG_TAG, "Error", error);
    next(error);
  }
};
/**
 * @api {put} /api/v1/customers/:customerId Update customer by id
 * @apiName Update customer by id
 * @apiGroup Admin
 * @apiHeader {String} Authorization The token can be generated from your customer profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Update customer by id successfully!</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Update list customer successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Not found"
 *     }
 */
const updateCustomerStatus = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "updateCustomerStatus Begin!");
    const customerId = req.params.customerId;
    const customer = await User.findById(customerId);

    if (!customer || customer.roleId !== 1)
      throw createHttpError(404, "Khách hàng không tồn tại!");
    await User.findByIdAndUpdate(customerId, {
      isBlocked: !(customer.isBlocked || false),
    });
    res.status(200).json({
      status: 200,
      msg: "Khóa khách hàng thành công!",
      customerId,
    });
    console.log(LOG_TAG, "updateCustomerStatus End!");
  } catch (error) {
    console.log(LOG_TAG, "Error", error);
    next(error);
  }
};

export const customerController = {
  getListCustomer,
  getCustomerById,
  updateCustomerStatus,
};
