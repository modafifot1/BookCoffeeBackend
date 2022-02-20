import { Schema, model } from "mongoose";
const bookSchema = new Schema({
  bookId: {
    type: Number,
  },
  title: {
    type: String,
  },
  author: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numOfFeedback: {
    type: Number,
    default: 0,
  },
  yearOfPublication: {
    type: Number,
  },
  imageUrl: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
});
export const Book = model("Book", bookSchema, "Book");
