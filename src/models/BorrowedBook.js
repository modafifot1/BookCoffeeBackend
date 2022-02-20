import { Schema, model } from "mongoose";

const borrowedBookSchema = new Schema({
  borrowerId: {
    type: Schema.Types.ObjectId,
  },
  borrowerName: {
    type: String,
  },
  craeteAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
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
});
export const BorrowedBook = model(
  "BorrowedBook",
  borrowedBookSchema,
  "BorrowedBook"
);
