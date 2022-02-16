import { Book, BorrowedBook, UserDetail } from "../models";
import { envVariables } from "../configs";
import createHttpError from "http-errors";
const LOG_TAG = "borrowedBookController";
const { numOfPerPage } = envVariables;
const getListBorrowedBookByStatus = async (res, req, next) => {
  try {
    console.log(LOG_TAG, "getListBorrowedBookByStatus start!");
    const user = req.user;
    const status = req.params.status;
    let borrowedBooks = [];
    let totalBorrowedBooks;
    if (user.roleId === 1) {
      borrowedBooks = await BorrowedBook.find({ borrowerId: user._id, status });
    } else {
      let { searchText, searchBy, orderBy, orderType, page } = req.body;
      let filter = {};
      searchBy = searchBy || "borrowerName";
      orderBy = orderBy || "createAt";
      orderType = orderType || 1;
      page = page || 1;
      if (searchText) filter = { [searchBy]: searchText };
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

const getBorrowedBookById = async (res, req, next) => {
  try {
    console.log(LOG_TAG, "getBorrowedBookById start!");
    const borrowedBookId = req.params.borrowedBookId;
    const borrowedBook = await BorrowedBook.findOne({ _id: borrowedBookId });
    if (!borrowedBook)
      throw createHttpError(400, "Get borrowed book by id successfully!");

    const borrowedBookItems = await Promise.all(
      borrowedBook.borrowedBookItems.map((item) =>
        Book.findOne({ _id: item.bookId })
      )
    );
    res.status(200).json({
      status: 200,
      msg: "Get borrowed book by id successfully!",
      borrowerId: borrowedBook.borrowerId,
      borrowerName: borrowedBook.borrowerName,
      craeteAt: borrowedBook.craeteAt,
      statusId: borrowedBook.statusId,
      updateAt: borrowedBook.updateAt,
      borrowedBookItems,
    });
    console.log(LOG_TAG, "getBorrowedBookById end!");
  } catch (error) {
    console.log(LOG_TAG, "getBorrowedBookById error - ", error);
    next(error);
  }
};

const createBorrowedBook = async (res, req, next) => {
  try {
    console.log(LOG_TAG, "createBorrowedBook start!");
    let { borrowerId, borrowedBookItems } = req.body;
    borrowerId = borrowerId || req.user._id;
    const borrowerDetail = await UserDetail.findOne({ userId: borrowerId });
    const books = await Promise.all(
      borrowedBookItems.map((item) => Book.findOne({ _id: item.bookId }))
    );
    await Promise.all(
      borrowedBookItems.map((item, index) =>
        Book.findOneAndUpdate(
          { _id: item.bookId },
          { quantity: books[index].quantity - item.quantity }
        )
      )
    );
    await BorrowedBook.create({
      borrowerId,
      borrowerName: borrowerDetail.fullName,
      borrowedBookItems,
    });
    res.status(201).json({
      status: 201,
      msg: "Create new borrowed book successfully!",
    });
    console.log(LOG_TAG, "createBorrowedBook end!");
  } catch (error) {
    console.log(LOG_TAG, "createBorrowedBook error - ", error);
    next(error);
  }
};

const updateBorrowedBookById = async (res, req, next) => {
  try {
    console.log(LOG_TAG, "updateBorrowedBookById start!");
    const borrowedBookId = req.params.borrowedBookId;
    const borrowedBook = await BorrowedBook.findByIdAndUpdate(borrowedBookId, {
      statusId: 1,
      updateAt: new Date(Date.now()),
    });
    if (!borrowedBook)
      throw createHttpError(400, "Borrowed Book is not exist!");
    res.status(200).json({
      status: 2000,
      msg: "Update Borrowed book successfully!",
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
