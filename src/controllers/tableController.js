import createHttpError from "http-errors";
import { Table } from "../models";

const LOG_TAG = "tableController";

/**
 * @api {get} /api/v1/tables Get list table by userId
 * @apiName Get list table
 * @apiGroup table
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get list tables sucessfully</code> if everything went fine.
 * @apiSuccess {Array} cartItems <code> List the tables <code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *        {
 *           "status": 200,
 *           "msg": "Get list table sucessfully!",
 *           "tables": [
 *               {
 *                   "_id": "607ee38c5061c506d4604111",
 *                   "tableCode": "607b99348f2d3500151f091d",
 *                   "status": "62/07 Đồng Kè, Liên Chiểu, Đà Năng",
 *                   "reserveredUserId": "212122100222cdaa5",
 *                   "bookingTime": "2021-04-21T02:09:30.509Z"
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
const getListTable = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getListTable begin!");
    const tables = await Table.find();
    res.status(200).json({
      status: 200,
      msg: "Get list table successfully!",
      tables,
    });
    console.log(LOG_TAG, "getListTable end!");
  } catch (error) {
    console.log(LOG_TAG, "getListTable error", error);
    next(error);
  }
};
/**
 * @api {post} /api/v1/tables/follow Follow list table by userId
 * @apiName Follow list table
 * @apiGroup table
 * @apiParam {array} tableIds List table id user want to subcribe
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get list tables sucessfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *        {
 *           "status": 200,
 *           "msg": "Subcribe list table sucessfully!",
 *       }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const subcribeTables = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "subcribeTables begin!");
    const { tableIds } = req.body;
    console.log(LOG_TAG, "subcribeTables - body: ", req.body);
    const result = await Table.updateMany(
      { _id: tableIds },
      { $push: { waitingLstId: req.user._id } }
    );
    if (!result) {
      throw createHttpError(404, "Not found table!");
    }
    res.status(200).json({
      status: 200,
      msg: "follow table successfully",
    });
    console.log(LOG_TAG, "subcribeTables end!");
  } catch (error) {
    console.log(LOG_TAG, "subcribeTables - error: ", error);
    next(error);
  }
};

export const tableController = {
  getListTable,
  subcribeTables,
};
