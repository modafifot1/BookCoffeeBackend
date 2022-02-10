import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { User, UserDetail } from "../models";
import Mongoose from "mongoose";
import { confirmResetCode, getResetCode, sendEmail } from "../utils";
//--------------------Managing employees---------------------------//

/**
 * @api {get} /api/v1/admin/employees Get list employees
 * @apiName Get list employees
 * @apiGroup Admin
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Get list employee successfully!</code> if everything went fine.
 * @apiSuccess {Array} employees <code> List of eployees</code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Get list employee successfully!",
 *         employees: [
 *          {
 *          "_id": "6076c201228fe14534c3ca4a",
 *           "email": "employees1@gmail.com",
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
const getListEmployees = async (req, res, next) => {
  try {
    let listEmployees = await User.aggregate([
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
          roleId: 2,
        },
      },
    ]);
    listEmployees = listEmployees.map((x) => {
      return {
        _id: x._id,
        email: x.email,
        roleId: x.roleId,
        fullName: x.userDetail[0].fullName,
        phoneNumber: x.userDetail[0].phoneNumber,
        birthday: x.userDetail[0].birthday,
        address: x.userDetail[0].address,
        isConfirmed: x.isConfirmed,
      };
    });
    res.status(200).json({
      status: 200,
      msg: "Get list employee successfully!",
      employees: listEmployees,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {post} /api/v1/admin/employees Create a new employee
 * @apiName Create a new eployees
 * @apiGroup Admin
 * @apiParam {String} email email's employee account
 * @apiParam {String} password password's employee account
 * @apiParam {Int} roleId role's employee required value = 2
 * @apiParam {String} fullName name's employee
 * @apiParam {String} phoneNumber phone's employee
 * @apiParam {Date} birthday birthday's employee
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 201 </code>
 * @apiSuccess {String} msg <code>Regitser success</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 201 OK
 *     {
 *         status: 201,
 *         msg: "Create an employee successfully!"
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const createNewEmployee = async (req, res, next) => {
  const { email, password, roleId, fullName, phoneNumber, birthday, address } =
    req.body;
  try {
    const userExisted = await User.findOne({ email });
    if (userExisted) {
      throw createHttpError(400, "This email is used by others!");
    }
    const checkRole = await Role.findOne({ id: roleId });
    if (!checkRole || checkRole.roleName != "employee") {
      throw createHttpError(401, "Role is invalid");
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password: hashPassword,
      roleId: roleId,
    });

    await UserDetail.create({
      userId: newUser._id,
      fullName,
      phoneNumber,
      birthday: new Date(birthday),
      address,
    });
    await initPermissions(roleId, newUser._id);
    const code = await getResetCode(newUser._id, next);
    const link = `https://obscure-inlet-52224.herokuapp.com/api/v1/auth/confirm-email?code=${code}&&userId=${newUser._id}`;
    await sendEmail(
      email,
      "Confirm Email",
      "Please click link bellow to confirm email!\n" + link
    );
    res.status(201).json({
      status: 201,
      msg: "Create a new employee successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @api {get} /api/v1/admin/employees/:employeeId Get an employee by id
 * @apiName Get an employee
 * @apiGroup Admin
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Regitser success</code> if everything went fine.
 * @apiSuccess {Object} employee <code> An employee </code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Get an employee successfully!",
 *         employee: {
 *              _id: "6020bd895d7a6b07b0b0eef9",
 *              email: "nqp260699@gmail.com",
 *              roleId: 1,
 *              "fullName": "Nguyen van A",
 *              "phoneNumber": "0325656596",
 *              "birthday": "1999-02-04T17:00:00.000Z",
 *         }
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Not found"
 *     }
 */
const getEmpployeeById = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;
    const employee = await User.aggregate([
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
          _id: Mongoose.Types.ObjectId(employeeId),
        },
      },
    ]);
    if (!employee) {
      throw createHttpError(400, "employeeId is not exist!");
    }
    res.status(200).json({
      status: 200,
      msg: "Get an employee successfully!",
      employee: {
        _id: employee[0]._id,
        email: employee[0].email,
        role: employee[0].role,
        createAt: employee[0].createAt,
        phoneNumber: employee[0].userDetail[0].phoneNumber,
        fullName: employee[0].userDetail[0].fullName,
        birthday: employee[0].userDetail[0].birthday,
        isConfirmed: employee[0].isConfirmed,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {put} /api/v1/admin/employees/:employeeId Update a employee
 * @apiName Update a eployees
 * @apiGroup Admin
 * @apiParam {String} employeeId id's employee
 * @apiParam {String} email email's employee
 * @apiParam {String} password password's employee
 * @apiParam {Int} role role's employee require value = 2
 * @apiParam {String} fullName name's employee
 * @apiParam {String} phoneNumber phone's employee
 * @apiParam {Date} birthday birthday's employee
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 201 </code>
 * @apiSuccess {String} msg <code>Update successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 201 OK
 *     {
 *         status: 201,
 *         msg: "Update an employee successfully!"
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const updateEmployeeById = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;
    const { roleId, fullName, phoneNumber, birthday } = req.body;
    const employee = await User.findByIdAndUpdate(employeeId, {
      roleId,
    });
    if (!employee) {
      throw createHttpError(400, "An employee is not exist!");
    }
    await UserDetail.findOneAndUpdate(
      { userId: employeeId },
      {
        fullName,
        phoneNumber,
        birthday: new Date(birthday),
      }
    );
    res.status(200).json({
      status: 200,
      msg: "Update an employee successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {delete} /api/v1/admin/employees/:employeeId Delete an employee by id
 * @apiName Delete an employee
 * @apiGroup Admin
 * @apiParam {String} employeeId id's employee
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Delete successfully</code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Get an employee successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Not found"
 *     }
 */
const deleteEmployeeById = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;
    const employee = await Promise.all([
      User.findByIdAndDelete(employeeId),
      UserDetail.findOneAndDelete({ userId: employeeId }),
    ]);
    let delPermissions = await UserPermission.find({ userId: employeeId });
    delPermissions = delPermissions.map((x) => x.permissionId);
    await delPermissionsForUserEffected(delPermissions, 2);
    if (!employee) {
      throw createHttpError(400, "An employee is not exist!");
    }
    res.status(200).json({
      status: 200,
      msg: "Delete an employee successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const employeeController = {
  createNewEmployee,
  getListEmployees,
  getEmpployeeById,
  updateEmployeeById,
  deleteEmployeeById,
};
