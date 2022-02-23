import { Schema, model } from "mongoose";

const BorrowedBookCartItemSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  bookId: {
    type: Schema.Types.ObjectId,
  },
  quantity: {
    type: Number,
  },
});
export const BorrowedBookCartItem = model(
  "BorrowedBookCart",
  BorrowedBookCartItemSchema,
  "BorrowedBookCart"
);
