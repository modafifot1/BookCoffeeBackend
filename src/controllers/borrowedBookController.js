import {
  Book,
  BorrowedBook,
  BorrowedBookCartItem,
  Order,
  UserDetail,
} from "../models";
import { envVariables } from "../configs";
import createHttpError from "http-errors";
const LOG_TAG = "borrowedBookController";
const { numOfPerPage } = envVariables;
const getListBorrowedBookByStatus = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getListBorrowedBookByStatus start!");
    const user = req.user;
    console.log(user);
    const status = req.params.status;
    let borrowedBooks = [];
    let totalBorrowedBooks;
    let filter = {};
    if (user.roleId === 1) {
      if (status != -1) filter = { ...filter, statusId: status };
      filter = { ...filter, borrowerId: req.user._id };
      borrowedBooks = await BorrowedBook.find(filter);
      let books = await Promise.all(
        borrowedBooks.map((item) =>
          Book.findOne({ _id: item.borrowedBookItems[0].bookId })
        )
      );
      borrowedBooks = borrowedBooks.map((item, index) => {
        return {
          ...item._doc,
          item: books[index]._doc,
        };
      });
      console.log(borrowedBooks);
    } else {
      let { searchText, searchBy, orderBy, orderType, page } = req.body;

      if (status != -1) filter = { statusId: status };
      searchBy = searchBy || "borrowerName";
      orderBy = orderBy || "createAt";
      orderType = orderType || 1;
      page = page || 1;
      if (searchText) filter = { ...filter, [searchBy]: searchText };
      const start = (page - 1) * numOfPerPage;
      totalBorrowedBooks = await BorrowedBook.find().count();
      borrowedBooks = await BorrowedBook.find(filter)
        .skip(start)
        .limit(numOfPerPage)
        .sort({ [orderBy]: orderType });
    }

    res.status(200).json({
      msg: "Get list borrowed book successfully!",
      status: 200,
      borrowedBooks,
      totalBorrowedBooks,
    });
    console.log(LOG_TAG, "getListBorrowedBookByStatus start!");
  } catch (error) {
    console.log(LOG_TAG, "getListBorrowedBookByStatus error - ", error);
    next(error);
  }
};

const getBorrowedBookById = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getBorrowedBookById start!");
    const borrowedBookId = req.params.borrowedBookId;
    const borrowedBook = await BorrowedBook.findOne({ _id: borrowedBookId });
    if (!borrowedBook)
      throw createHttpError(400, "Get borrowed book by id successfully!");

    let borrowedBookItems = await Promise.all(
      borrowedBook.borrowedBookItems.map((item) =>
        Book.findOne({ _id: item.bookId })
      )
    );
    borrowedBookItems = borrowedBookItems.map((item, index) => {
      return {
        ...item._doc,
        quantity: borrowedBook.borrowedBookItems[index].quantity,
      };
    });
    console.log(borrowedBook);

    res.status(200).json({
      status: 200,
      msg: "Get borrowed book by id successfully!",
      craeteAt: borrowedBook.craeteAt,
      statusId: borrowedBook.statusId,
      tableCode: borrowedBook.tableCode,
      updateAt: borrowedBook.updateAt,
      borrowedBookItems,
    });
    console.log(LOG_TAG, "getBorrowedBookById end!");
  } catch (error) {
    console.log(LOG_TAG, "getBorrowedBookById error - ", error);
    next(error);
  }
};

const createBorrowedBook = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "createBorrowedBook start!");
    let { borrowerId, borrowedBookItems } = req.body;
    console.log(borrowedBookItems);
    let startDate, endDate;

    endDate = new Date(Date.now());
    startDate = new Date(Date.now());

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    let order = await Order.findOne({
      updateAt: {
        $gte: startDate,
        $lt: endDate,
      },
      isPaid: true,
      customerId: req.user._id,
    });
    if (!order)
      throw createHttpError(
        400,
        "Vui lòng thanh toán ít nhất 1 đơn hàng thành công để mượn sách"
      );
    //limit borrowedBook
    const borrowedBooks = await BorrowedBook.find({
      borrowerId: req.user._id,
      statusId: { $ne: 2 },
    });
    console.log("BorrowedBooks", borrowedBooks);
    if (borrowedBooks.length >= 2)
      throw createHttpError(
        400,
        "Số lượt mượn sách đã quá 2 lần! Vui lòng trả sách trước khi mượn!"
      );

    borrowerId = borrowerId || req.user._id;
    const borrowerDetail = await UserDetail.findOne({ userId: borrowerId });
    const books = await Promise.all(
      borrowedBookItems.map((item) => Book.findOne({ _id: item.bookId }))
    );
    for (let i = 0; i < borrowedBookItems.length; i++) {
      if (!books[i])
        throw createHttpError(404, "Không tìm thấy sách cần mượn!");
      if (books[i].quantity < borrowedBookItems[i].quantity)
        throw createHttpError(400, "Số lượng sách có sẵn không đủ!");
      await Promise.all([
        Book.findOneAndUpdate(
          { _id: borrowedBookItems[i].bookId },
          { quantity: books[i].quantity - borrowedBookItems[i].quantity }
        ),
        BorrowedBookCartItem.deleteOne({ _id: borrowedBookItems[i]._id }),
      ]);
    }
    const borowedBook = await BorrowedBook.create({
      borrowerId,
      borrowerName: borrowerDetail.fullName,
      borrowedBookItems,
      tableCode: order.tableCode,
      orderId: order._id,
    });
    res.status(201).json({
      status: 201,
      msg: "Create new borrowed book successfully!",
      borowedBook,
    });
    console.log(LOG_TAG, "createBorrowedBook end!");
  } catch (error) {
    console.log(LOG_TAG, "createBorrowedBook error - ", error);
    next(error);
  }
};

const updateBorrowedBookById = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "updateBorrowedBookById start!");
    const borrowedBookId = req.params.borrowedBookId;
    const borrowedBook = await BorrowedBook.findOne({ _id: borrowedBookId });
    if (!borrowedBook)
      throw createHttpError(400, "Borrowed Book is not exist!");
    await BorrowedBook.findByIdAndUpdate(borrowedBookId, {
      statusId: borrowedBook.statusId + 1,
      updateAt: new Date(Date.now()),
    });

    res.status(200).json({
      status: 2000,
      msg: "Update Borrowed book successfully!",
      borrowedBookId,
    });
    console.log(LOG_TAG, "updateBorrowedBookById end!");
  } catch (error) {
    console.log(LOG_TAG, "updateBorrowedBookById end!");
    next(error);
  }
};
export const borrowedBookController = {
  getListBorrowedBookByStatus,
  getBorrowedBookById,
  createBorrowedBook,
  updateBorrowedBookById,
};
