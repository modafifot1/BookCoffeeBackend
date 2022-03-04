import { Schema, model } from "mongoose";

const borrowedBookSchema = new Schema({
  borrowerId: {
    type: Schema.Types.ObjectId,
  },
  borrowerName: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  statusId: {
    type: Number,
    default: 0,
  },
  borrowedBookItems: [
    {
      bookId: {
        type: Schema.Types.ObjectId,
      },
      quantity: {
        type: Number,
      },
    },
  ],
  numOfItems: {
    type: Number,
  },
  tableCode: {
    type: Number,
  },
  orderId: {
    type: Schema.Types.ObjectId,
  },
  phoneNumber: {
    type: String,
  },
  item: {
    type: Object,
  },
});
export const BorrowedBook = model(
  "BorrowedBook",
  borrowedBookSchema,
  "BorrowedBook"
);
