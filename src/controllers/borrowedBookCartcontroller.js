import createHttpError from "http-errors";
import { BorrowedBookCartItem } from "../models";
import Mongoose from "mongoose";

const getBorrowBookCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let borrowedBookCartItems = await BorrowedBookCartItem.aggregate([
      {
        $lookup: {
          from: "Book",
          localField: "bookId",
          foreignField: "_id",
          as: "detail",
        },
      },
      {
        $match: {
          userId: Mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    console.log(borrowedBookCartItems[0]);
    let totalItems = 0;
    borrowedBookCartItems = borrowedBookCartItems.map((x) => {
      totalItems += x.quantity;
      return {
        _id: x._id,
        bookId: x.bookId,
        quantity: x.quantity,
        title: x.detail[0].title,
        author: x.detail[0].author,
        imageUrl: x.detail[0].imageUrl,
        bookQuantity: x.detail[0].quantity,
      };
    });
    res.status(200).json({
      status: 200,
      msg: "Get cart item successfully!",
      borrowedBookCartItems,
      numOfAddedItems: totalItems,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addOneBookToCart = async (userId, bookId, quantity) => {
  try {
    const bookCartItem = await BorrowedBookCartItem.findOne({
      userId,
      bookId,
    });
    if (bookCartItem) {
      await BorrowedBookCartItem.findByIdAndUpdate(bookCartItem._id, {
        quantity: bookCartItem.quantity + quantity,
      });
    } else {
      await BorrowedBookCartItem.create({
        userId,
        bookId,

        quantity,
      });
    }
  } catch (error) {
    throw createHttpError(400, "Cannot add book to cart");
  }
};

const addBookToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let { bookCartItems } = req.body;
    console.log("body data: ", req.body);
    let total = 0;

    console.log(bookCartItems);
    const keys = Object.keys(bookCartItems);
    for (const key of keys) {
      total += bookCartItems[key];
      await addOneBookToCart(userId, key, bookCartItems[key]);
    }

    res.status(201).json({
      status: 201,
      msg: "Add book cart item successfully!",
      numOfAddedItems: total,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateBorrowedBookCartItemById = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const borowedBookCartItemId = req.params.borowedBookCartItemId;
    const borowedBookCartItem = await BorrowedBookCartItem.findById(
      borowedBookCartItemId
    );
    if (!borowedBookCartItem) {
      throw createHttpError(404, "Not found book cart item");
    }
    await BorrowedBookCartItem.findByIdAndUpdate(borowedBookCartItemId, {
      quantity,
    });
    res.status(200).json({
      msg: "Update quantity book cart item successfully!",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const deleteBorrowedBookCartItemById = async (req, res, next) => {
  try {
    let { borrowedBookCartItems } = req.body;
    console.log(req.body);
    const cartItem = await BorrowedBookCartItem.deleteMany({
      _id: {
        $in: borrowedBookCartItems,
      },
    });
    if (cartItem.length == 0) {
      throw createHttpError(400, "Cannot delete book cart item!");
    }
    res.status(200).json({
      msg: "Delete book cart item successfully!",
      status: 200,
      borrowedBookCartItems,
    });
  } catch (error) {
    next(error);
  }
};
export const borrowedBookCartController = {
  getBorrowBookCart,
  addBookToCart,
  updateBorrowedBookCartItemById,
  deleteBorrowedBookCartItemById,
};
