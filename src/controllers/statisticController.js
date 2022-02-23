import createHttpError from "http-errors";
import { Order, OrderItem, User, Food, BorrowedBook, Book } from "../models";
import { dateFunction } from "../utils";

const { getMonthsByquater, getQuaterByMonth, getDateInWeek } = dateFunction;

const getRevenuesInfo = async (req, res, next) => {
  try {
    let { getInfoBy } = req.params;
    console.log("GetinfoBy: ", getInfoBy);
    getInfoBy = Number(getInfoBy) || 0;
    let data = [];
    const today = new Date();
    let revenues = {};
    var orders;
    switch (getInfoBy) {
      case 0:
        console.log("Get by week");
        const dateInWeek = getDateInWeek(today);
        var startDate = dateInWeek[0];
        var endDate = dateInWeek[1];
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log("StartDate: ", startDate);
        console.log("Enddate: ", endDate);
        orders = await Order.find({
          updateAt: {
            $gte: startDate,
            $lt: endDate,
          },
          statusId: 2,
        });
        orders = orders.map((x) => {
          return {
            day: new Date(x.updateAt).getDay(),
            revenue: x.total,
          };
        });

        revenues = orders.reduce((init, cur) => {
          if (!init[cur.day]) init[cur.day] = cur.revenue;
          else init[cur.day] = init[cur.day] + cur.revenue;
          return init;
        }, {});
        break;
      case 1:
        console.log("Get by month");
        var month = today.getMonth() + 1;
        var year = today.getFullYear();
        month = Number(month);
        year = Number(year);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log("StartDate: ", startDate);
        console.log("Enddate: ", endDate);
        orders = await Order.find({
          updateAt: {
            $gte: startDate,
            $lt: endDate,
          },
          statusId: 2,
        });
        orders = orders.map((x) => {
          return {
            date: new Date(x.updateAt).getDate(),
            revenue: x.total,
          };
        });
        revenues = orders.reduce((init, cur) => {
          if (!init[cur.date]) init[cur.date] = cur.revenue;
          else init[cur.date] = init[cur.date] + cur.revenue;
          return init;
        }, {});
        console.log(revenues);
        break;
      case 2:
        console.log("Get by quater");

        let quater = getQuaterByMonth(today.getMonth() + 1);
        year = today.getFullYear();
        quater = Number(quater);
        year = Number(year);
        const months = getMonthsByquater(quater);

        startDate = new Date(year, months[0] - 1, 1);
        endDate = new Date(year, months[2] - 1, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log("StartDate: ", startDate);
        console.log("Enddate: ", endDate);
        orders = await Order.find({
          updateAt: {
            $gte: startDate,
            $lt: endDate,
          },
          statusId: 2,
        });
        orders = orders.map((x) => {
          return {
            month: new Date(x.updateAt).getMonth() + 1,
            revenue: x.total,
          };
        });
        revenues = orders.reduce((init, cur) => {
          if (!init[cur.month]) init[cur.month] = cur.revenue;
          else init[cur.month] = init[cur.month] + cur.revenue;
          return init;
        }, {});
        console.log(revenues);
        break;
      case 3:
        console.log("Get by year");

        year = today.getFullYear();
        year = Number(year);
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log("StartDate: ", startDate);
        console.log("Enddate: ", endDate);
        orders = await Order.find({
          updateAt: {
            $gte: startDate,
            $lt: endDate,
          },
          statusId: 2,
        });
        orders = orders.map((x) => {
          return {
            month: new Date(x.updateAt).getMonth(),
            revenue: x.total,
          };
        });
        revenues = orders.reduce((init, cur) => {
          if (!init[cur.month]) init[cur.month] = cur.revenue;
          else init[cur.month] = init[cur.month] + cur.revenue;
          return init;
        }, {});
        console.log(revenues);
        break;
      default:
        throw createHttpError(400, "Not found getInfoBy");
    }
    console.log(revenues);
    res.status(200).json({
      status: 200,
      msg: "Get revenues successfully!",
      revenues,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getGeneralInfo = async (req, res, next) => {
  try {
    let orders = await Order.find({ statusId: 2 });
    const totalRevenues = orders.reduce((pre, cur) => pre + cur.total, 0);
    const totalCustomers = await User.find({ roleId: 2 }).count();
    const totalOrders = await Order.find({ statusId: 2 }).count();
    // const totalCourses = await Order.find({ orderType: 2, statusId: 4 }).count;

    let popularFoodIds = await OrderItem.aggregate([
      {
        $group: {
          _id: "$foodId",
          count: { $sum: 1 },
        },
      },

      {
        $sort: { count: -1 },
      },
    ]);

    if (popularFoodIds.length > 20)
      popularFoodIds = popularFoodIds.slice(0, 20);
    let popularFoods = await Promise.all(
      popularFoodIds.map((item) => Food.findById(item._id))
    );
    popularFoods = popularFoods.map((item, index) => {
      return {
        ...item._doc,
        amountOfBuy: popularFoodIds[index].count,
      };
    });

    let popularBorrowedBookIds = await BorrowedBook.aggregate([
      {
        $unwind: "$borrowedBookItems",
      },
      {
        $group: {
          _id: "$borrowedBookItems.bookId",
          count: { $sum: 1 },
        },
      },

      {
        $sort: { count: -1 },
      },
    ]);

    if (popularBorrowedBookIds.length > 20)
      popularBorrowedBookIds = popularBorrowedBookIds.slice(0, 20);
    let popularBorrowedBooks = await Promise.all(
      popularBorrowedBookIds.map((item) => Book.findById(item._id))
    );
    popularBorrowedBooks = popularBorrowedBooks.map((item, index) => {
      return {
        ...item._doc,
        amountOfBuy: popularBorrowedBookIds[index].count,
      };
    });

    let popularRecipe = [];

    res.status(200).json({
      status: 200,
      msg: "Get general statistic successfully!",
      totalOrders,
      totalCustomers,
      totalRevenues,
      popularFoods,
      popularBorrowedBooks,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const statisticController = { getRevenuesInfo, getGeneralInfo };
