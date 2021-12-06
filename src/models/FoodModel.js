import { Schema, model } from "mongoose";
const foodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discountOff: {
    type: Number,
  },
  discountMaximum: {
    type: Number,
  },
  description: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
  },
  numOfStars: {
    type: Number,
  },
  numOfFeedbacks: {
    type: Number,
  },
  confirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
});
foodSchema.index({ name: "text" });
export const Food = model("Food", foodSchema, "Food");
